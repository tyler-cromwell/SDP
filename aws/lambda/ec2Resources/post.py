import json
import boto3
import uuid


def get_missing_keys(required_keys, actual_keys):
    missing_keys = []
    for key in required_keys:
        if key not in actual_keys:
            missing_keys.append(key)            
    return missing_keys


def main(event, context):
    required = ['name', 'machineImage', 'instanceType',
                'keyName', 'state', "projectId"]

    missing_keys = get_missing_keys(required, event.keys())

    if len(missing_keys) > 0:
        return {
            'error': 'Missing require keys: {}'.format(missing_keys)
        }

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('EC2ResourcesTable')

    result = table.put_item(
        Item={
            'id': str(uuid.uuid4()),
            'projectId': event['projectId'], # TODO: validate projectId exists
            'name': event['name'],
            'machineImage': event['machineImage'],
            'instanceType': event['instanceType'],
            'keyName': event['keyName'],
            # broken logic
            'userData': 'None',
            'state': event['state']
        }
    )

    return result
