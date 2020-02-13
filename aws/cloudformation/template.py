import json

import boto3

import utils


class Template:
    def __init__(
        self,
        description='',
        version='2010-09-09'
    ):
        self.json = {
            'AWSTemplateFormatVersion': version,
            'Description': description,
            'Resources': {},
            'Outputs': {}
        }

    def add_ec2_instance(
        self,
        name,
        instance_type,
        key_name,
        machine_image,
        user_data=''
    ):
        self.json['Resources'][name] = {
            'Type': 'AWS::EC2::Instance',
            'Properties': {
                'ImageId': machine_image,
                'InstanceType': instance_type,
                'KeyName': key_name,
                'UserData': {
                    'Fn::Base64': user_data
                }
            }
        }
        self.json['Outputs']['InstanceId'] = {
            'Value': {
                'Ref': name
            }
        }
        self.json['Outputs']['AvailabilityZone'] = {
            'Value': {
                'Fn::GetAtt': [name, 'AvailabilityZone']
            }
        }


    def create_stack(
        self,
        stack_name,
        key_names=[]
    ):
        response = {}
        cfclient = boto3.client('cloudformation')
        ec2client = boto3.client('ec2')

        for name in key_names:
            result = ec2client.describe_key_pairs(KeyNames=[name])

            if len(result['KeyPairs']) == 0:
                response[name] = ec2client.create_key_pair(KeyName=name)

        response[stack_name] = cfclient.create_stack(
            StackName=stack_name,
            TemplateBody=json.dumps(self.json)
        )

        return response
