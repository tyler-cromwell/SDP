import json


class Template:
    def __init__(self, description='', version='2010-09-09'):
        self.json = {
            'AWSTemplateFormatVersion': version,
            'Description': description,
            'Resources': {},
            'Outputs': {}
        }
        self.keys = []


    def add_ec2_instance(self, name, instance_type, key_name, machine_image, user_data=''):
        if key_name not in self.keys:
            self.keys.append(key_name)

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
        self.json['Outputs']['PublicDns'] = {
            'Value': {
                'Fn::GetAtt': [name, 'PublicDnsName']
            }
        }
        self.json['Outputs']['PublicIp'] = {
            'Value': {
                'Fn::GetAtt': [name, 'PublicIp']
            }
        }

    def add_lambda_function(self, name, filename, rolename):
        with open(filename) as fp:
            code = fp.read()

        self.json['Resources'][name] = {
            'Type': 'AWS::Lambda::Function',
            'Properties': {
                'Code': {
                    'ZipFile': code
                },
                'FunctionName': name,
                'Handler': 'index.main',
                'Role': {
                    'Fn::GetAtt': [rolename, 'Arn']
                },
                'Runtime': 'python3.7'
            }
        }

    def add_iam_role(self, name, policies):
        self.json['Resources'][name] = {
            'Type': 'AWS::IAM::Role',
            'Properties': {
                'AssumeRolePolicyDocument': {
                    'Version': '2012-10-17',
                    'Statement': [
                        {
                            'Effect': 'Allow',
                            'Principal': {
                                'Service': [
                                    'lambda.amazonaws.com'
                                ]
                            },
                            'Action': [
                                'sts:AssumeRole'
                            ]
                        }
                    ]
                },
                'ManagedPolicyArns': [
                    'arn:aws:iam::aws:policy/AmazonEC2FullAccess'
                ],
                'RoleName': name
            }
       }
