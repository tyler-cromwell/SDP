import datetime
import json

import boto3


def datetime_handler(x):
    if isinstance(x, datetime.datetime):
        return x.isoformat()
    raise TypeError("Unknown type")


def main(event, context):
    client = boto3.client('ec2')
    response = client.describe_instances()
    return json.dumps(response, default=datetime_handler)
