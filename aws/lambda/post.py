import boto3


ec2 = boto3.resource('ec2')


def post_instances(event, context):
    required = ['type', 'minCount', 'maxCount']

    if False in [k in event.keys() for k in required]:
        return {
            'error': 'Missing a required key'
        }

    instance = ec2.create_instances(
        ImageId='ami-04b9e92b5572fa0d1',
        InstanceType=event['type'],
        KeyName='cse4940-ec2-keypair',
        MaxCount=int(event['minCount']),
        MinCount=int(event['maxCount'])
    )

    return {
        'instance': str(instance),
    }
