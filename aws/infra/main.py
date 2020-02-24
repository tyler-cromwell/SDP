#!/usr/bin/env python3
import sys

import boto3
import botocore

import client
import template
import utils


def read_credentials(filename):
    with open(filename) as fp:
        return tuple(fp.read().splitlines())


if __name__ == '__main__':
    if len(sys.argv) == 1:
        print('Usage: ./main.py <AWS credentials file>')
        sys.exit(1)

    access, secret = read_credentials(sys.argv[1])
    session = boto3.session.Session(
        aws_access_key_id=access,
        aws_secret_access_key=secret,
    )

    keypair = 'MyEC2KeyPair01'
    template = template.Template()
    template.add_lambda_function(
        name='MyLambdaFunction01',
        filename='get.py'
    )
    """
    template.add_ec2_instance(
        name='MyEC2Instance01',
        instance_type='t2.micro',
        key_name=keypair,
        machine_image='ami-04b9e92b5572fa0d1'
    )
    """
    print(utils.prettify_json(template.json))

    try:
        cfclient = session.client('cloudformation')
        response = cfclient.describe_stacks(
            StackName='MyCFStack01'
        )
        print(utils.prettify_json(response))
        print('Stack exists')
    except botocore.exceptions.ClientError:
        print('Stack does not exist')
        response = client.create_stack(
            session=session,
            stack_name='MyCFStack01',
            template=template
        )
        print(utils.prettify_json(response))
        print('Stack template uploaded')
