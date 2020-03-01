import json
import uuid
import boto3

def main(event, context):  
  required = ['firstName', 'lastName', 'email', 'role']

  if False in [k in event.keys() for k in required]:
    return {
      'error': 'Missing a required key'
    }
  
  client = boto3.client('dynamodb')

  result = client.put_item(
    TableName='cse4940-users',
    Item={
      'id': {
        'S': str(uuid.uuid1())
      },
      'firstName': {
        'S': event['firstName']
      },
      'lastName': {
        'S': event['lastName']
      },
      'email': {
        'S': event['email']
      },
      'role': {
        'S': event['role']
      }
    }
  )

  return json.dumps(result)
