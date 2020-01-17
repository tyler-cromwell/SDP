import json

import boto3


def post_instances(event, context):
    required = ['type', 'minCount', 'maxCount']

    if False in [k in event.keys() for k in required]:
        return {
            'error': 'Missing a required key'
        }

    resource = boto3.resource('ec2')
    instances = resource.create_instances(
        ImageId='ami-04b9e92b5572fa0d1',
        InstanceType=event['type'],
        KeyName='cse4940-ec2-keypair',
        MaxCount=int(event['minCount']),
        MinCount=int(event['maxCount'])
    )

    return json.dumps({
        'instances': [instance.id for instance in instances],
    })
