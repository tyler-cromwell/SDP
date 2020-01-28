import datetime
import json

import boto3


def datetime_handler(x):
    if isinstance(x, datetime.datetime):
        return x.isoformat()
    raise TypeError("Unknown type")


def post_instances(event, context):
    required = ['type', 'minCount', 'maxCount']

    if False in [k in event.keys() for k in required]:
        return {
            'error': 'Missing a required key'
        }

    client = boto3.client('ec2')
    instances = client.run_instances(
        ImageId='ami-04b9e92b5572fa0d1',
        InstanceType=event['type'],
        KeyName='cse4940-ec2-keypair',
        MinCount=int(event['minCount']),
        MaxCount=int(event['maxCount'])
    )

    return json.dumps(instances, default=datetime_handler)
