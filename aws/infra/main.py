#!/usr/bin/env python3
import sys
import argparse

import boto3
import botocore

import client
import template
from utils import read_credentials, get_random_name, stack_exists

if __name__ == '__main__':
    my_parser = argparse.ArgumentParser(
        description='CloudFormation template builder.'
    )

    DEFAULT_KEY_PAIR = "MyEC2KeyPair01"

    my_parser.add_argument('-p', '--path', action='store', type=str,
                           required=True, help="path to AWS credentials file")
    my_parser.add_argument('-sn', '--stack-name', action='store', type=str,
                           required=False, default=get_random_name(), help="name of CloudFormation stack")
    my_parser.add_argument('-ec2k', '--ec2-key-pair', action='store', type=str,
                           required=False, default=DEFAULT_KEY_PAIR, help="name of EC2 key pair")
    my_parser.add_argument('-ec2n', '--ec2-name', action='store', type=str,
                           required=False, default=get_random_name(), help="name of EC2 instance")
    my_parser.add_argument('-lfn', '--lambda-function-name', action='store', type=str,
                           required=False, default=get_random_name(), help="name of lambda function")
    my_parser.add_argument('-lfnp', '--lambda-function-path', action='store',
                           type=str, required=False, help="path of lambda function")

    args = my_parser.parse_args()

    PATH = args.path
    STACK_NAME = args.stack_name
    EC2_KEY_PAIR = args.ec2_key_pair
    EC2_NAME = args.ec2_name
    LAMBDA_FUNCTION_NAME = args.lambda_function_name
    LAMBDA_FUNCTION_PATH = args.lambda_function_path

    ACCESS, SECRET = read_credentials(PATH)

    session = boto3.session.Session(
        aws_access_key_id=ACCESS,
        aws_secret_access_key=SECRET,
    )

    template = template.Template()
    # template.add_lambda_function(LAMBDA_FUNCTION_NAME, LAMBDA_FUNCTION_PATH)
    template.add_ec2_instance(
        name=EC2_NAME,
        instance_type='t2.micro',
        key_name=EC2_KEY_PAIR,
        machine_image='ami-04b9e92b5572fa0d1'
    )

    cfclient = session.client('cloudformation')

    if stack_exists(cfclient, STACK_NAME):
        print('Stack "{}" exists!'.format(STACK_NAME))
    else:
        response = client.create_stack(
            session=session,
            stack_name=STACK_NAME,
            template=template
        )
        print('Stack "{}" created!'.format(STACK_NAME))
