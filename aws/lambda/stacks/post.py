import json

import boto3


def main(event, context):
    required = ['name', 'template', 'keys']

    if False in [k in event.keys() for k in required]:
        return {
            'error': 'Missing required key'
        }
    
    response = {}
    stack_name = event['name']
    keys = json.loads(event['keys'])
    template = event['template']
    cfclient = boto3.client('cloudformation')
    ec2client = boto3.client('ec2')

    for name in keys:
        result = ec2client.describe_key_pairs(KeyNames=[name])
        
        if len(result['KeyPairs']) == 0:
            response[name] = ec2client.create_key_pair(KeyName=name)

    response[stack_name] = cfclient.create_stack(
        StackName=stack_name,
        TemplateBody=json.dumps(template)
    )

    return response
