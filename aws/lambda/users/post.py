import json
import boto3

def main(event, context):
  required = ['firstName', 'lastName', 'email', 'role']

  if False in [k in event.keys() for k in required]:
    return {
      'error': 'Missing a required key'
    }
  
  dynamodb = boto3.resource('dynamodb')
  table = dynamodb.Table('UsersTable')

  result = table.put_item(
    Item={
      'firstName': event['firstName'],
      'lastName': event['lastName'],
      'email': event['email'],
      'role': event['role']
    }
  )

  return result
