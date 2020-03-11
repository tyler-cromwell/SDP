import json
import uuid
import boto3
from boto3.dynamodb.conditions import Key, Attr


def isOwnerValid(email: str) -> bool:
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('UsersTable')
    
    result = table.scan(
        FilterExpression=Attr('email').eq(email)
    )
    
    return len(result["Items"]) == 1


def main(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('ProjectsTable')
    
    required = ['name', 'owner', 'description', 'version']

    if False in [k in event.keys() for k in required]:
        return {
            'error': 'Missing a required key'
        }

    if not isOwnerValid(event['owner']):
        return {
            'error': 'Owner does not exist'
        }

    projectId: str = str(uuid.uuid1())

    result = table.put_item(
        Item={
            'id': projectId,
            'name': event['name'],
            'owner': event['owner'],
            'description': event['description'],
            'version':event['version']
        }
    )
    
    result = table.query(
        KeyConditionExpression=Key('id').eq(projectId)
    )

    return result["Items"][0]
