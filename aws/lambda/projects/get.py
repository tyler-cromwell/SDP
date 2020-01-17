import json

import boto3


def get_projects(event, context):
    client = boto3.client('dynamodb')

    return client.get_item(
        TableName='cse4940-projects',
        Key={
            'ProjectId': {
                'N': '0',
            }
        }
    )
