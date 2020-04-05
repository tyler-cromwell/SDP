import json

import boto3


def main(event, context):
    cfclient = boto3.client('cloudformation')
    dbclient = boto3.client('dynamodb')

    if 'id' not in event.keys():
        return {
            'error': 'Key \'id\' missing'
        }

    pid = event['id']

    # Look up the project row
    project = dbclient.get_item(
        TableName='ProjectsTable',
        Key={
            'id': {
                'S': pid
            }
        }
    )

    # Delete CloudFormation stack
    cfclient.delete_stack(
        StackName=project['Item']['name']['S'].replace(' ', '')
    )

    # Get the associated rows from "EC2ResourcesTable" table
    response = dbclient.scan(
        TableName='EC2ResourcesTable',
        ExpressionAttributeNames={
            '#id': 'id'
        },
        ExpressionAttributeValues={
            ':id': {
                'S': pid
            }
        },
        FilterExpression='projectId = :id',
        ProjectionExpression='#id'
    )

    # Delete the associated rows from "EC2ResourcesTable" table
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
                'S': pid
            }
        }
    )

    return response
