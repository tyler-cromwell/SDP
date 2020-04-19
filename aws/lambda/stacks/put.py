import json

import boto3


def main(event, context):
    required = set(['stackName', 'template'])

    missing_keys = required - set(event.keys())

    if len(missing_keys) > 0:
        return {            
            "errorMessage": "missing required key(s): {}".format(missing_keys),
            "statusCode": "400"    
        }
    
    response = {
        'stackId': '',
        'keys': [],
        'statusCode': '200'
    }

    template = event['template']

    ec2client = boto3.client('ec2')

    # Check if EC2 resources types have specified EC2 key pair name exists and, if not, create a key pair and add to response 
    for resource in template['Resources'].values():
        resourceType = resource['Type']        
        if resourceType == 'AWS::EC2::Instance':
            keyName = resource["Properties"]["KeyName"]
            result = ec2client.describe_key_pairs(Filters=[{'Name': 'key-name', 'Values': [keyName]}])             
            if len(result['KeyPairs']) == 0:
                response['keys'].append(ec2client.create_key_pair(KeyName=keyName))
            # else:
            #     print("result = " + json.dumps(resource, indent=4))
            #     resource['keys'].append(result['KeyPairs'][0])                       
              
    cfclient = boto3.client('cloudformation')    

    response['stackId'] = cfclient.update_stack(
        StackName=event['stackName'],
        TemplateBody=json.dumps(event['template'])
    )["StackId"]

    return response