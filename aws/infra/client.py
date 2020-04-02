import json


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
