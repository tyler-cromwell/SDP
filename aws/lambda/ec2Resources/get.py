import json

import boto3
from boto3.dynamodb.conditions import Key, Attr


def main(event, context):
    required = ['projectName']

    if False in [k in event.keys() for k in required]:
        return {
            'error': 'Missing required key'
        }

    projectName = event['projectName']

    client = boto3.client('ec2')

    custom_filter = [
        {
            'Name': 'tag:ProjectName', 
            'Values': [ projectName ]
        }
    ]

    response = json.dumps(client.describe_instances(Filters=custom_filter))

    return response