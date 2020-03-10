#!/usr/bin/env python3
import argparse
import itertools
import pathlib
import sys

import boto3
import botocore

import client
import template
import utils

THIS_DIR = pathlib.Path(__file__).parent.absolute()


if __name__ == '__main__':
    my_parser = argparse.ArgumentParser(
        description='CloudFormation template builder.'
    )

    DEFAULT_KEY_PAIR = "MyEC2KeyPair01"

    # Define command line interface
    my_parser.add_argument('-p', '--path', action='store', type=str,
                           required=True, help="path to AWS credentials file")
    my_parser.add_argument('-sn', '--stack-name', action='store', type=str,
                           required=False, default=utils.get_random_name(), help="name of CloudFormation stack")
    my_parser.add_argument('-ec2k', '--ec2-key-pair', action='store', type=str,
                           required=False, default=DEFAULT_KEY_PAIR, help="name of EC2 key pair")
    my_parser.add_argument('-ec2n', '--ec2-name', action='store', type=str,
                           required=False, default=utils.get_random_name(), help="name of EC2 instance")

    args = my_parser.parse_args()

    PATH = args.path
    STACK_NAME = args.stack_name
    EC2_KEY_PAIR = args.ec2_key_pair
    EC2_NAME = args.ec2_name
    API_NAME = 'API'
    API_DEPLOYMENT_NAME = API_NAME+'InitialDeployment'
    API_STAGE_NAME = 'development'
    API_USAGE_PLAN_NAME = API_NAME+'UsagePlan'
    API_KEY_NAME = API_NAME+'Key'
    API_RESOURCES = ['Projects', 'Stacks', 'Users']
    API_RESOURCE_METHODS = {
        'Projects': ['DELETE', 'GET', 'POST'],
        'Stacks': ['POST'],
        'Users': ['GET', 'POST']
    }
    API_LAMBDAS = {
        'Projects': {
            'DELETE': 'ProjectsDELETELambda',
            'GET': 'ProjectsGETLambda',
            'POST': 'ProjectsPOSTLambda',
        },
        'Stacks': {
            'POST': 'StacksPOSTLambda'
        },
        'Users': {
            'GET': 'UsersGETLambda',
            'POST': 'UsersPOSTLambda'
        }
    }

    ACCESS, SECRET = utils.read_credentials(PATH)

    session = boto3.session.Session(
        aws_access_key_id=ACCESS,
        aws_secret_access_key=SECRET,
    )

    template = template.Template()
    """
    template.add_ec2_instance(
        name=EC2_NAME,
        instance_type='t2.micro',
        key_name=EC2_KEY_PAIR,
        machine_image='ami-04b9e92b5572fa0d1'
    )
    """
    # Generate Database tables
    template.add_dynamodb_table(
        name='ProjectsTable',
        reads=1000,
        writes=1000
    )
    template.add_dynamodb_table(
        name='UsersTable',
        reads=1000,
        writes=1000
    )

    # Generate Lambda functions
    template.add_lambda_function(
        name='ProjectsDELETELambda',
        filename=str(THIS_DIR)+'/../lambda/projects/delete.py',
        rolename='ProjectsDELETELambdaRole',
        managed_policies=[
            'arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess',
        ]
    )
    template.add_lambda_function(
        name='ProjectsGETLambda',
        filename=str(THIS_DIR)+'/../lambda/projects/get.py',
        rolename='ProjectsGETLambdaRole',
        managed_policies=[
            'arn:aws:iam::aws:policy/AmazonDynamoDBReadOnlyAccess',
        ]
    )
    template.add_lambda_function(
        name='ProjectsPOSTLambda',
        filename=str(THIS_DIR)+'/../lambda/projects/post.py',
        rolename='ProjectsPOSTLambdaRole',
        managed_policies=[
            'arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess',
        ]
    )
    template.add_lambda_function(
        name='StacksPOSTLambda',
        filename=str(THIS_DIR)+'/../lambda/stacks/post.py',
        rolename='StacksPOSTLambdaRole',
        managed_policies=[
            'arn:aws:iam::aws:policy/AWSCloudFormationFullAccess',
        ]
    )
    template.add_lambda_function(
        name='UsersGETLambda',
        filename=str(THIS_DIR)+'/../lambda/users/get.py',
        rolename='UsersGETLambdaRole',
        managed_policies=[
            'arn:aws:iam::aws:policy/AmazonDynamoDBReadOnlyAccess',
        ]
    )
    template.add_lambda_function(
        name='UsersPOSTLambda',
        filename=str(THIS_DIR)+'/../lambda/users/post.py',
        rolename='UsersPOSTLambdaRole',
        managed_policies=[
            'arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess',
        ]
    )

    # Generate the API Gateway REST API
    template.add_apigateway_api(
        name=API_NAME
    )
    for resource in API_RESOURCES:
        prefixed_methods = [resource+m for m in API_RESOURCE_METHODS[resource]]

        template.add_apigateway_resource(
            name=resource,
            api_name=API_NAME
        )

        for method in API_RESOURCE_METHODS[resource]:
            template.add_apigateway_method(
                lambda_name=API_LAMBDAS[resource][method],
                method_type=method,
                api_name=API_NAME,
                resource=resource,
                full_path=resource,     # Note: resource nesting must be accounted for
                require_key=True
            )

        template.enable_apigateway_resource_cors(
            resource_name=resource,
            api_name=API_NAME,
            methods=prefixed_methods,
            allow_http_methods=API_RESOURCE_METHODS[resource]
        )

    all_methods = list(
        itertools.chain.from_iterable(
            [
                [
                    k+s for s in API_RESOURCE_METHODS[k]+['OPTIONS']
                ] for k in API_RESOURCE_METHODS.keys()
            ]
        )
    )
    template.add_apigateway_deployment(
        name=API_DEPLOYMENT_NAME,
        api_name=API_NAME,
        stage_name=API_STAGE_NAME,
        methods=all_methods
    )
    template.add_apigateway_usage_plan(
        name=API_USAGE_PLAN_NAME,
        api_name=API_NAME,
        key_name=API_KEY_NAME,
        stage_name=API_STAGE_NAME,
        deployment_name=API_DEPLOYMENT_NAME
    )

    # Submit the template to Cloud Formation for stack construction
    cfclient = session.client('cloudformation')

    if utils.stack_exists(cfclient, STACK_NAME):
        print('Stack "{}" already exists!'.format(STACK_NAME))
    else:
        response = client.create_stack(
            session=session,
            stack_name=STACK_NAME,
            template=template
        )
        print('Stack "{}" uploaded.'.format(STACK_NAME))
        print(utils.prettify_json(response))
