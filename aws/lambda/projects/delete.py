import json

import boto3


def main(event, context):
    cfclient = boto3.client('cloudformation')
    dbclient = boto3.client('dynamodb')
    required = ['id']

    if False in [k in event.keys() for k in required]:
        return {
            'error': 'Missing a required key'
        }

    # Look up the project row
    project = dbclient.get_item(
        TableName='ProjectsTable',
        Key={
            'id': {
                'S': event['id']
            }
        }
    )

    # Delete CloudFormation stack
    cfclient.delete_stack(
        StackName=project['Item']['name']['S'].replace(' ', '')
    )

    # Get the associated rows from "EC2Resources" table
    response = dbclient.scan(
        TableName='EC2ResourcesTable',
        ExpressionAttributeNames={
            '#id': 'id'
        },
        ExpressionAttributeValues={
            ':id': {
                'S': event['id']
            }
        },
        FilterExpression='projectId = :id',
        ProjectionExpression='#id'
    )
    
    # Delete the associated rows from "EC2Resources" table
    for row in response['Items']:
        response = dbclient.delete_item(
            TableName='EC2ResourcesTable',
            Key={
                'id': {
                    'S': row['id']['S']
                }
            }
        )

    # Delete project row from "ProjectsTable" table
    response = dbclient.delete_item(
        TableName='ProjectsTable',
        Key={
            'id': {
                'S': event['id']
            }
        }
    )

    return response
