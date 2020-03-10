import json

import boto3


def main(event, context):
    required = ['id']

    if False in [k in event.keys() for k in required]:
        return {
            'error': 'Missing a required key'
        }
    
    client = boto3.client('dynamodb')
    result = client.delete_item(
        TableName='ProjectsTable',
        Key={
            'ProjectId': {
                'N': event['id']
            }
        }
    )

    return json.dumps(result)
