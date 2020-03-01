import json
import uuid
import boto3
from boto3.dynamodb.conditions import Key, Attr

def isOwnerValid(email: str) -> bool:
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('cse4940-users')
    
    result = table.query(
        KeyConditionExpression=Key('email').eq(email)
    )
    
    return len(result["Items"]) == 1

def main(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('cse4940-projects')
    
    required = ['name', 'owner', 'description', 'version']

    if False in [k in event.keys() for k in required]:
        return {
            'error': 'Missing a required key'
        }

    if not isOwnerValid(event['owner']):
        return {
            'error': 'Owner does not exist'
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