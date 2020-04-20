import json
import time


def create_stack(session, stack_name, template):
    cfclient = session.client('cloudformation')
    ec2client = session.client('ec2')
    response = {}

    for name in template.keys:
        result = ec2client.describe_key_pairs(Filters=[{'Name': 'key-name', 'Values': [name]}])

        if len(result['KeyPairs']) == 0:
            response[name] = ec2client.create_key_pair(KeyName=name)

    response[stack_name] = cfclient.create_stack(
        StackName=stack_name,
        TemplateBody=json.dumps(template.json),
        Capabilities=['CAPABILITY_NAMED_IAM']
    )

    return response


def stack_exists(session, stack_name):
    cfclient = session.client('cloudformation')

    try:
        cfclient.describe_stacks(StackName=stack_name)
        return True
    except:
        return False


def update_stack(session, stack_name, template):
    cfclient = session.client('cloudformation')
    ec2client = session.client('ec2')
    response = {}

    for name in template.keys:
        result = ec2client.describe_key_pairs(Filters=[{'Name': 'key-name', 'Values': [name]}])

        if len(result['KeyPairs']) == 0:
            response[name] = ec2client.create_key_pair(KeyName=name)

    response[stack_name] = cfclient.update_stack(
        StackName=stack_name,
        TemplateBody=json.dumps(template.json),
        Capabilities=['CAPABILITY_NAMED_IAM']
    )

    return response


def wait_for_completion(session, stack_name, api_name, key_name, region_name, stage_name):
    apiclient = session.client('apigateway')
    cfclient = session.client('cloudformation')
    result = {'status': False}
    stacks = []
    attempts = 0
    stop = False

    # Try for a maximum of 2 minutes
    while stop is False and attempts < 60:
        time.sleep(2)   # API forces us to poll for status update

        response = cfclient.list_stacks(
            StackStatusFilter=[
                'CREATE_COMPLETE', 'CREATE_FAILED', 'CREATE_IN_PROGRESS'
            ]
        )
        stacks = response['StackSummaries']

        for stack in stacks:
            if stack['StackName'] == stack_name:
                if stack['StackStatus'] == 'CREATE_COMPLETE':
                    api_resource = cfclient.describe_stack_resource(StackName=stack_name, LogicalResourceId=stack_name+api_name)
                    key_resource = cfclient.describe_stack_resource(StackName=stack_name, LogicalResourceId=stack_name+key_name)

                    api_id = api_resource['StackResourceDetail']['PhysicalResourceId']
                    key_id = key_resource['StackResourceDetail']['PhysicalResourceId']
                    key_info = apiclient.get_api_key(apiKey=key_id, includeValue=True)

                    result['url'] = 'https://{}.execute-api.{}.amazonaws.com/{}/'.format(api_id, region_name, stage_name)
                    result['x-api-key'] = key_info['value']
                    result['status'] = True
                    stop = True
                    break
                elif stack['StackStatus'] == 'CREATE_IN_PROGRESS':
                    attempts += 1
                    break
                else:
                    break

    return result
