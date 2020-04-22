import json

import utils


class LambdaParams:
    def __init__(self, function_name, file_name, managed_policies=[], mapping_template='', proxy=False):
        self.name = function_name
        self.file = file_name
        self.role = function_name+'Role'
        self.policies = managed_policies
        self.mapping_template = mapping_template
        self.is_proxy = proxy


class Template:
    def __init__(self, name, description='', version='2010-09-09'):
        self.stack_name = name
        self.keys = []
        self.json = {
            'AWSTemplateFormatVersion': version,
            'Description': description,
            'Resources': {},
            'Outputs': {}
        }


    def _FnGetAtt(self, name, att):
        return {'Fn::GetAtt': [name, att]}


    def _FnJoin(self, delimiter, array):
        return {'Fn::Join': [delimiter, array]}


    def _FnSub(self, string, dic={}):
        if dic == {}:
            return {'Fn::Sub': string}
        else:
            return {'Fn::Sub': [string, dic]}


    def _Ref(self, name):
        return {'Ref': name}


    def save_as_json(self, filename):
        with open(filename, 'w') as outf:
            print(utils.prettify_json(self.json), file=outf)


    def save_as_yaml(self, filename):
        utils.dict_to_yaml(self.json, filename)


    def add_apigateway_api(self, name):
        # Namespace (prefix) resource names/ids
        full_name = self.stack_name + name

        self.json['Resources'][full_name] = {
            'Type': 'AWS::ApiGateway::RestApi',
            'Properties': {
                'ApiKeySourceType': 'HEADER',
                'Name': full_name
            }
        }


    def add_apigateway_deployment(self, name, api_name, stage_name, methods):
        # Namespace (prefix) resource names/ids
        full_name = self.stack_name + name
        full_api_name = self.stack_name + api_name

        self.json['Resources'][full_name] = {
            'DependsOn': [self.stack_name + m for m in methods],
            'Type': 'AWS::ApiGateway::Deployment',
            'Properties': {
                'RestApiId': self._Ref(full_api_name),
                'StageName': stage_name
            }
        }


    def add_apigateway_stage(self, name, api_name, deployment_name):
        # Namespace (prefix) resource names/ids
        full_name = self.stack_name + name
        full_api_name = self.stack_name + api_name
        full_deploy_name = self.stack_name + deployment_name

        self.json['Resources'][full_name] = {
            'DependsOn': full_deploy_name,
            'Type': 'AWS::ApiGateway::Stage',
            'Properties': {
                'DeploymentId': self._Ref(full_deploy_name),
                'RestApiId': self._Ref(full_api_name),
                'StageName': name
            }
        }


    def add_apigateway_usage_plan(self, name, api_name, key_name, stage_name, deployment_name):
        # Namespace (prefix) resource names/ids
        full_name = self.stack_name + name
        full_plan_key_name = full_name + 'Key'
        full_key_name = self.stack_name + key_name
        full_api_name = self.stack_name + api_name
        full_deploy_name = self.stack_name + deployment_name

        # Create the API Usage Plan and associate with a Stage.
        self.json['Resources'][full_name] = {
            'DependsOn': full_deploy_name,
            'Type': 'AWS::ApiGateway::UsagePlan',
            'Properties': {
                'ApiStages': [
                    {
                        'ApiId': self._Ref(full_api_name),
                        'Stage': stage_name,
                    }
                ],
                'UsagePlanName': full_name
            }
        }

        # Create an API key for the Usage Plan.
        self.json['Resources'][full_key_name] = {
            'DependsOn': full_name,
            'Type': 'AWS::ApiGateway::ApiKey',
            'Properties': {
                'Enabled': True,
                'Name': full_key_name,
                'StageKeys': [
                    {
                        'RestApiId': self._Ref(full_api_name),
                        'StageName': stage_name
                    }
                ]
            }
        }

        # Associates the previously created API key with the Usage Plan.
        self.json['Resources'][full_plan_key_name] = {
            'DependsOn': full_key_name,
            'Type': 'AWS::ApiGateway::UsagePlanKey',
            'Properties': {
                'KeyId': self._Ref(full_key_name),
                'KeyType': 'API_KEY',
                'UsagePlanId': self._Ref(full_name)
            }
        }

        self.json['Outputs'][full_key_name] = {
            'Value': self._Ref(full_key_name)
        }


    def add_apigateway_resource(self, name, api_name, parent_name=''):
        # Namespace (prefix) resource names/ids
        full_name = self.stack_name + name
        full_api_name = self.stack_name + api_name
        full_parent_name = self.stack_name + parent_name

        parent_ref = (
            self._Ref(full_parent_name)
            if parent_name
            else self._FnGetAtt(full_api_name, 'RootResourceId')
        )

        self.json['Resources'][full_name] = {
            'DependsOn': full_api_name,
            'Type': 'AWS::ApiGateway::Resource',
            'Properties': {
                'ParentId': parent_ref,
                'PathPart': name,
                'RestApiId': self._Ref(full_api_name)
            }
        }


    def enable_apigateway_resource_cors(self, resource_name, api_name, methods=[], allow_http_methods=[]):
        # Namespace (prefix) resource names/ids/methods
        full_api_name = self.stack_name + api_name
        full_resource_name = self.stack_name + resource_name
        full_options_resource_name = self.stack_name + resource_name + 'OPTIONS'
        full_method_names = [self.stack_name + m for m in methods]

        allow_http_methods.append('OPTIONS')

        resource_ref = (
            self._Ref(full_resource_name)
            if resource_name
            else self._FnGetAtt(full_api_name, 'RootResourceId')
        )

        # Create the OPTIONS method
        self.json['Resources'][full_options_resource_name] = {
            'DependsOn': [
                full_api_name,
                full_resource_name,
            ] + full_method_names,
            'Type': 'AWS::ApiGateway::Method',
            'Properties': {
                'AuthorizationType': 'NONE',
                'HttpMethod': 'OPTIONS',
                'Integration': {
                    'IntegrationResponses': [
                        {
                            'ResponseParameters': {
                                'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                                'method.response.header.Access-Control-Allow-Methods': '\''+(','.join(allow_http_methods))+'\'',
                                'method.response.header.Access-Control-Allow-Origin': "'*'"
                            },
                            'ResponseTemplates': {
                                'application/json': ''
                            },
                            'StatusCode': 200
                        }
                    ],
                    'PassthroughBehavior': 'NEVER',
                    'RequestTemplates': {
                        'application/json': '{\n \"statusCode\": 200\n}'
                    },
                    'Type': 'MOCK'
                },
                'MethodResponses': [
                    {
                        'ResponseModels': {
                            'application/json': 'Empty'
                        },
                        'ResponseParameters': {
                            'method.response.header.Access-Control-Allow-Headers': str(True),
                            'method.response.header.Access-Control-Allow-Methods': str(True),
                            'method.response.header.Access-Control-Allow-Origin': str(True)
                        },
                        'StatusCode': 200
                    }
                ],
                'ResourceId': resource_ref,
                'RestApiId': self._Ref(full_api_name)
            }
        }

        # Update each method/integration response for existing methods
        for method in methods:
            full_method = self.stack_name + method
            keys = self.json['Resources'][full_method]['Properties'].keys()

            if 'Integration' in keys and 'MethodResponses' in keys:
                iresponses = self.json['Resources'][full_method]['Properties']['Integration']['IntegrationResponses']
                mresponses = self.json['Resources'][full_method]['Properties']['MethodResponses']

                for iresponse in iresponses:
                    iresponse['ResponseParameters'] = {
                        'method.response.header.Access-Control-Allow-Origin': "'*'"
                    }

                for mresponse in mresponses:
                    mresponse['ResponseParameters'] = {
                        'method.response.header.Access-Control-Allow-Origin': str(True)
                    }


    def add_apigateway_proxy_method(self, method_type, api_name, lambda_name, resource_name='', full_path='', require_key=False):
        # Namespace (prefix) resource names/ids/methods
        full_api_name = self.stack_name + api_name
        full_lambda_name = self.stack_name + lambda_name
        full_resource_name = self.stack_name + resource_name
        full_method_name = full_resource_name + method_type

        resource_ref = (
            self._Ref(full_resource_name)
            if resource_name
            else self._FnGetAtt(full_api_name, 'RootResourceId')
        )

        # Allow the API method permission to execute the Lambda function
        self.json['Resources'][full_lambda_name + 'Permission'] = {
            'Type': 'AWS::Lambda::Permission',
            'Properties': {
                'Action': 'lambda:InvokeFunction',
                'FunctionName': self._FnGetAtt(full_lambda_name, 'Arn'),
                'Principal': 'apigateway.amazonaws.com',
                'SourceArn': self._FnSub('arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${'+full_api_name+'}/*/'+method_type+'/'+full_path)
            }
        }

        self.json['Resources'][full_method_name] = {
            'DependsOn': [
                full_api_name,
                full_lambda_name
            ],
            'Type': 'AWS::ApiGateway::Method',
            'Properties': {
                'ApiKeyRequired': require_key,
                'AuthorizationType': 'NONE',
                'HttpMethod': method_type,
                'Integration': {
                    'IntegrationHttpMethod': 'POST',
                    'Type': 'AWS_PROXY',
                    'Uri': self._FnSub('arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${'+full_lambda_name+'.Arn}/invocations')
                },
                'ResourceId': resource_ref,
                'RestApiId': self._Ref(full_api_name)
            }
        }


    def add_apigateway_method(self, method_type, api_name, lambda_name, resource_name='', full_path='', require_key=False, mapping_template=''):
        # Namespace (prefix) resource names/ids/methods
        full_api_name = self.stack_name + api_name
        full_lambda_name = self.stack_name + lambda_name
        full_resource_name = self.stack_name + resource_name
        full_method_name = full_resource_name + method_type

        resource_ref = (
            self._Ref(full_resource_name)
            if resource_name
            else self._FnGetAtt(full_api_name, 'RootResourceId')
        )

        # Allow the API method permission to execute the Lambda function
        self.json['Resources'][full_lambda_name + 'Permission'] = {
            'Type': 'AWS::Lambda::Permission',
            'Properties': {
                'Action': 'lambda:InvokeFunction',
                'FunctionName': self._FnGetAtt(full_lambda_name, 'Arn'),
                'Principal': 'apigateway.amazonaws.com',
                'SourceArn': self._FnSub('arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${'+full_api_name+'}/*/'+method_type+'/'+full_path)
            }
        }   

        self.json['Resources'][full_method_name] = {
            'DependsOn': [
                full_api_name,
                full_lambda_name
            ],
            'Type': 'AWS::ApiGateway::Method',
            'Properties': {
                'ApiKeyRequired': require_key,
                'AuthorizationType': 'NONE',
                'HttpMethod': method_type,
                'Integration': {
                    'IntegrationHttpMethod': 'POST',
                    'IntegrationResponses': [
                        {
                            'ResponseTemplates': {
                                'application/json': ''
                            },
                            'StatusCode': 200
                        }
                    ],
                    'PassthroughBehavior': 'WHEN_NO_TEMPLATES',   
                    'Type': 'AWS',
                    'Uri': self._FnSub('arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${'+full_lambda_name+'.Arn}/invocations')
                },
                'MethodResponses': [
                    {
                        'ResponseModels': {
                            'application/json': 'Empty'
                        },
                        'StatusCode': 200
                    }
                ],
                'ResourceId': resource_ref,
                'RestApiId': self._Ref(full_api_name)
            }
        }

        if mapping_template != '':
             self.json['Resources'][full_method_name]["Properties"]["Integration"]["RequestTemplates"] = {
                "application/json": mapping_template
             }


    def add_dynamodb_table(self, name, reads, writes):
        # Namespace (prefix) resource names/ids
        full_name = self.stack_name + name + 'Table'

        self.json['Resources'][full_name] = {
            'Type': 'AWS::DynamoDB::Table',
            'Properties': {
                'AttributeDefinitions': [
                    {
                        'AttributeName': 'id',
                        'AttributeType': 'S'
                    }
                ],
                'KeySchema': [
                    {
                        'AttributeName': 'id',
                        'KeyType': 'HASH'
                    }
                ],
                'ProvisionedThroughput': {
                    'ReadCapacityUnits': reads,
                    'WriteCapacityUnits': writes
                },
                'TableName': full_name
            }
        }


    def add_ec2_instance(self, name, instance_type, key_name, machine_image, user_data=''):
        # Namespace (prefix) resource names/ids/methods
        full_name = self.stack_name + name
        full_key_name = self.stack_name + key_name

        if key_name not in self.keys:
            self.keys.append(full_key_name)

        self.json['Resources'][full_name] = {
            'Type': 'AWS::EC2::Instance',
            'Properties': {
                'ImageId': machine_image,
                'InstanceType': instance_type,
                'KeyName': full_key_name,
                'UserData': {
                    'Fn::Base64': user_data
                }
            }
        }

        iid = self._Ref(full_name)
        az = self._FnGetAtt(name, 'AvailabilityZone')
        ip = self._FnGetAtt(name, 'PublicIp')
        dns = self._FnGetAtt(name, 'PublicDnsName')

        """
        This ugly block of code below encodes into the CloudFormation template,
        instructions for CloudFormation to produce the instance's:
            - Instance id (id)
            - Availability zone (az)
            - Public IP address (ip)
            - Public DNS name (dns)
        and then pack those values into a JSON object as an output of stack creation.
        Each JSON object is keyed by the logical ID of the EC2 Instance.
        """
        self.json['Outputs'][full_name] = {
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


    def add_lambda_function(self, name, filename, rolename, managed_policies=[]):
        # Namespace (prefix) resource names/ids/methods
        full_name = self.stack_name + name
        full_role_name = self.stack_name + rolename

        with open(filename) as fp:
            code = fp.read()

        # Create IAM role so function can write logs
        self.json['Resources'][full_role_name] = {
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
                'RoleName': full_role_name
            }
        }

        self.json['Resources'][full_name] = {
            'DependsOn': full_role_name,
            'Type': 'AWS::Lambda::Function',
            'Properties': {
                'Code': {
                    'ZipFile': code
                },
                'FunctionName': full_name,
                'Handler': 'index.main',
                'Role': self._FnGetAtt(full_role_name, 'Arn'),
                'Runtime': 'python3.7'
            }
        }
