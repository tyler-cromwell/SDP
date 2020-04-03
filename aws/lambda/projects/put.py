import boto3
from boto3.dynamodb.conditions import Key


def main(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('ProjectsTable')
    required = ['id', 'name', 'owner', 'description', 'version', 'template']

    if False in [k in event.keys() for k in required]:
        return {
            'error': 'Missing a required key'
        }

    # Find and delete the original row
    result = table.scan(
        FilterExpression=Key('id').eq(event['id'])
    )

    table.delete_item(
        Key={
            'id': event['id']
        }
    )

    # Reconstruct row with updated values
    item = result['Items'][0]

    for key in event.keys():
        item[key] = event[key]

    # Save updated row & return result
    result = table.put_item(Item=item)
    
    result = table.query(
        KeyConditionExpression=Key('id').eq(event['id'])
    )

    return result["Items"][0]
