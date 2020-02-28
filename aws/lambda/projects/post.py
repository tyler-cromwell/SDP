import json

import boto3


def main(event, context):
    required = ['name', 'owner', 'description']

    if False in [k in event.keys() for k in required]:
        return {
            'error': 'Missing a required key'
        }
    
    client = boto3.client('dynamodb')
    size = len(list(client.scan(TableName='cse4940-projects')["Items"]))

    client.put_item(
        TableName='cse4940-projects',
        Item={
            'ProjectId': {
                'N': str(size)
            },
            'Name': {
                'S': event['name']
            },
            'Owner': {
                'S': event['owner']
            },
            'Version': {
                'S': '1.0.0'
            },
            'Description': {
                'S': event['description']
            },
            'Resources': {
                'L': []
            }
        }
    )
    
    result = client.get_item(
        TableName='cse4940-projects',
        Key={
            'ProjectId': {
                'N': str(size)
            }
        }
    )

    return json.dumps(result)
