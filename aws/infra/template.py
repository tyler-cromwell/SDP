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


    def _FnGetAtt(self, name, att):
        return {'Fn::GetAtt': [name, att]}


    def _FnJoin(self, delimiter, array):
        return {'Fn::Join': [delimiter, array]}


    def _Ref(self, name):
        return {'Ref': name}


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

        iid = self._Ref(name)
        az = self._FnGetAtt(name, 'AvailabilityZone')
        ip = self._FnGetAtt(name, 'PublicIp')
        dns = self._FnGetAtt(name, 'PublicDnsName')

        """
        This ugly block of code below encodes into the Cloud Formation template,
        instructions for Cloud Formation to produce the instance's:
            - Instance id (id)
            - Availability zone (az)
            - Public IP address (ip)
            - Public DNS name (dns)
        and then pack those values into a JSON object as an output of stack creation.
        Each JSON object is keyed by the logical ID of the EC2 Instance.
        """
        self.json['Outputs'][name] = {
            'Value': self._FnJoin(
                delimiter='',
                array=[
                    '\"{',
                    self._FnJoin(
                        delimiter=', ',
                        array=[
                            self._FnJoin(
                                delimiter=': ',
                                array=['\\\"id\\\"',  self._FnJoin(delimiter='', array=['\\\"', iid, '\\\"'])]
                            ),
                            self._FnJoin(
                                delimiter=': ',
                                array=['\\\"az\\\"',  self._FnJoin(delimiter='', array=['\\\"', az, '\\\"'])]
                            ),
                            self._FnJoin(
                                delimiter=': ',
                                array=['\\\"ip\\\"',  self._FnJoin(delimiter='', array=['\\\"', ip, '\\\"'])]
                            ),
                            self._FnJoin(
                                delimiter=': ',
                                array=['\\\"dns\\\"', self._FnJoin(delimiter='', array=['\\\"', dns, '\\\"'])]
                            )
                        ]
                    ),
                    '}\"'
                ]
            )
        }


    def add_lambda_function(self, name, filename, create_role=True):
        with open(filename) as fp:
            code = fp.read()

        rolename=name+'Role'

        if create_role:
            self.add_iam_role(
                name=rolename,
                managed_policies=[
                    'arn:aws:iam::aws:policy/AmazonEC2FullAccess'
                ],
                assume_policy={
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
                }
            )

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


    def add_iam_role(self, name, managed_policies, assume_policy):
        self.json['Resources'][name] = {
            'Type': 'AWS::IAM::Role',
            'Properties': {
                'AssumeRolePolicyDocument': assume_policy,
                'ManagedPolicyArns': managed_policies,
                'Policies': [
                    {
                        'PolicyName': 'allow-logs',
                        'PolicyDocument': {
                            'Version': '2012-10-17',
                            'Statement': [
                                {
                                    'Effect': 'Allow',
                                    'Action': [
                                        'logs:*'
                                    ],
                                    'Resource': 'arn:aws:logs:*:*:*'
                                }
                            ]
                        }
                    }
                ],
                'RoleName': name
            }
       }
