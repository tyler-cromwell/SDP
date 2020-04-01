#!/usr/bin/env python3
import argparse
import itertools
import pathlib
import sys

import boto3
import botocore

import client
from template import LambdaParams, Template
import utils

THIS_DIR = pathlib.Path(__file__).parent.absolute()


if __name__ == '__main__':
    my_parser = argparse.ArgumentParser(
        description='CloudFormation template builder.'
    )

    DEFAULT_KEY_PAIR = "MyEC2KeyPair01"
    REGION_NAME = 'us-east-2'

    # Define command line interface
    my_parser.add_argument('-p', '--path', action='store', type=str,
                           required=True, help="path to AWS credentials file")
    my_parser.add_argument('-r', '--region', action='store', type=str,
                           required=False, default=REGION_NAME, help="AWS region")
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
    API_RESOURCES = ['Instances', 'Projects', 'Stacks', 'Users', 'EC2Resources']
    API_RESOURCE_METHODS = {
        'Instances': ['GET', 'POST'],
        'Projects': ['DELETE', 'GET', 'POST'],
        'Stacks': ['POST'],
        'Users': ['GET', 'POST'],
        'EC2Resources': ['GET', 'POST']
    }
    API_LAMBDAS = {
        'EC2Resources': {
            'GET': LambdaParams(
                'EC2ResourcesGETLambda',
                '/../lambda/ec2Resources/get.py',
                ['arn:aws:iam::aws:policy/AmazonDynamoDBReadOnlyAccess'],
                utils.read_mapping_template("../lambda/ec2Resources/GETMappingTemplate")
            ),
            'POST': LambdaParams(
                'EC2ResourcesPOSTLambda',
                '/../lambda/ec2Resources/post.py',
                ['arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess'],
                utils.read_mapping_template("../lambda/ec2Resources/POSTMappingTemplate")
            )
        },
        'Instances': {
            'GET': LambdaParams(
                'InstancesGETLambda',
                '/../lambda/instances/get.py',
                ['arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess']
            ),
            'POST': LambdaParams(
                'InstancesPOSTLambda',
                '/../lambda/instances/post.py',
                ['arn:aws:iam::aws:policy/AmazonEC2FullAccess']
            )
        },
        'Projects': {
            'DELETE': LambdaParams(
                'ProjectsDELETELambda',
                '/../lambda/projects/delete.py',
                ['arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess']
            ),
            'GET': LambdaParams(
                'ProjectsGETLambda',
                '/../lambda/projects/get.py',
                ['arn:aws:iam::aws:policy/AmazonDynamoDBReadOnlyAccess'],
                utils.read_mapping_template("../lambda/projects/GETMappingTemplate")
            ),
            'POST': LambdaParams(
                'ProjectsPOSTLambda',
                '/../lambda/projects/post.py',
                ['arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess'],
                utils.read_mapping_template("../lambda/projects/POSTMappingTemplate")
            )
        },
        'Stacks': {
            'POST': LambdaParams(
                'StacksPOSTLambda',
                '/../lambda/stacks/post.py',
                [
                    'arn:aws:iam::aws:policy/AWSCloudFormationFullAccess',
                    'arn:aws:iam::aws:policy/AmazonEC2FullAccess'
                ]
            )
        },
        'Users': {
            'GET': LambdaParams(
                'UsersGETLambda',
                '/../lambda/users/get.py',     
                ['arn:aws:iam::aws:policy/AmazonDynamoDBReadOnlyAccess']        
            ),
            'POST': LambdaParams(
                'UsersPOSTLambda',
                '/../lambda/users/post.py',
                ['arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess'],
                utils.read_mapping_template("../lambda/users/postMappingTemplate")
            )
        }
    }

    ACCESS, SECRET = utils.read_credentials(PATH)
    session = boto3.Session(ACCESS, SECRET, region_name=REGION_NAME)
    
    """
    session = boto3.session.Session(
        aws_access_key_id=ACCESS,
        aws_secret_access_key=SECRET,        
    )
    """

    template = Template()
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
        reads=1,
        writes=1
    )
    template.add_dynamodb_table(
        name='UsersTable',
        reads=1,
        writes=1
    )
    template.add_dynamodb_table(
        name='EC2ResourcesTable',
        reads=1,
        writes=1
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
            function = API_LAMBDAS[resource][method]

            template.add_lambda_function(
                name=function.name,
                filename=str(THIS_DIR)+function.file,
                rolename=function.role,
                managed_policies=function.policies
            )

            template.add_apigateway_method(
                lambda_name=function.name,
                method_type=method,
                api_name=API_NAME,
                resource=resource,
                full_path=resource,     # Note: resource nesting must be accounted for
                require_key=True,
                mapping_template=function.mapping_template
            )

        template.enable_apigateway_resource_cors(
            resource_name=resource,
            api_name=API_NAME,
            methods=prefixed_methods,
            allow_http_methods=API_RESOURCE_METHODS[resource]
        )

    all_methods = list(
        itertools.chain.from_iterable([
            [k+s for s in API_RESOURCE_METHODS[k]+['OPTIONS']]
            for k in API_RESOURCE_METHODS.keys()
        ])
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
