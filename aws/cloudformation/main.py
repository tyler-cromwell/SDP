#!/usr/bin/env python3
import template
import utils

import boto3


"""
Check for existence of KeyPairs, Stacks
EC2 Instances:
    - Key pairs must be created first
"""


if __name__ == '__main__':
    keypair = 'MyEC2KeyPair01'
    template = template.Template()
    template.add_ec2_instance(
        name='MyEC2Instance01',
        instance_type='t2.micro',
        key_name=keypair,
        machine_image='ami-04b9e92b5572fa0d1'
    )
    print(utils.prettify_json(template.json))

    """
    response = template.create_stack(
        stack_name='MyCFStack01'
    )
    print(utils.prettify_json(response))
    """

    cfclient = boto3.client('cloudformation')
    response = cfclient.describe_stacks(
        StackName='MyCFStack01'
    )
    print(utils.prettify_json(response))
