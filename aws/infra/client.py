import json


def create_stack(session, stack_name, template):
    cfclient = session.client('cloudformation')
    ec2client = session.client('ec2')
    response = {}

    for name in template.keys:
        result = ec2client.describe_key_pairs(KeyNames=[name])

        if len(result['KeyPairs']) == 0:
            response[name] = ec2client.create_key_pair(KeyName=name)

    response[stack_name] = cfclient.create_stack(
        StackName=stack_name,
        TemplateBody=json.dumps(template.json),
        Capabilities=['CAPABILITY_NAMED_IAM']
    )

    return response
