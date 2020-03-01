import json
import uuid
import boto3

# def isOwnerValid(email: str) -> bool:
#     return True;

def main(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('cse4940-projects')
    print(json.dumps(event, indent=4, sort_keys=True))
    
    required = ['name', 'owner', 'description', 'version']

    if False in [k in event.keys() for k in required]:
        return {
            'error': 'Missing a required key'
        }

    result = table.put_item(
        Item={
            'id': str(uuid.uuid1()),
            'name': event['name'],
            'owner': event['owner'],
            'description': event['description'],
            'version':event['version']
        }
    )

    return result
