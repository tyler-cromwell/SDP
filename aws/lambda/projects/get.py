import json

import boto3


def main(event, context):
    client = boto3.client('dynamodb')
    return json.dumps(client.get_item(TableName='cse4940-projects'))
