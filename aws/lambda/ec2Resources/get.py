import json
import datetime

import boto3


def main(event, context):    
    if 'projectName' not in event:
        return {            
            "ErrorMessage": 'missing required key: "projectName"',
            "StatusCode": '400'    
        }

    projectName = event['projectName']

    client = boto3.client('ec2')

    custom_filter = [
        {
            'Name': 'tag:ProjectName', 
            'Values': [ projectName ]
        }
    ]

    def myconverter(o):
        if isinstance(o, datetime.datetime):
            return o.__str__()
 
    response = client.describe_instances(Filters=custom_filter)
    response = json.dumps(response, default = myconverter) # serialize datetimes object to string format
    response = json.loads(response) # deserialize from string
    return response