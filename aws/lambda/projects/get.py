import json
import boto3
from boto3.dynamodb.conditions import Key, Attr


def main(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('CSE4940ProjectsTable')

    name = event["name"] if 'name' in event else None
    owner = event["owner"] if 'owner' in event else None

    if name and owner:
        result = table.scan(
            FilterExpression=Key('name').eq(name) & Key('owner').eq(owner)
        )
    elif name:
        result = table.scan(
            FilterExpression=Key('name').eq(name)
        )
    elif owner:
        result = table.scan(
            FilterExpression=Key('owner').eq(owner)
        )
    else:
        result = table.scan(
            Select="ALL_ATTRIBUTES"
        )

    return result["Items"]
