import json

import boto3


def get_projects(event, context):
    client = boto3.client('dynamodb')
    return json.dumps(client.get_item(TableName='cse4940-projects'))
