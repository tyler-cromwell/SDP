import json

import boto3
from boto3.dynamodb.conditions import Key, Attr


def main(event, context):
    required = ['projectId']

    if False in [k in event.keys() for k in required]:
        return {
            'error': 'Missing required key'
        }

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('EC2ResourcesTable')

    projectId = event['projectId']

    result = table.scan(
        FilterExpression=Key('projectId').eq(projectId)
    )

    return result["Items"]