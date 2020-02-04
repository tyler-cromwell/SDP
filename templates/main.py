import boto3
cf_client = boto3.client('cloudformation')

# StackName: name of stack, can be dynamically generated, it must be unique
# TemplateURL: the URL of the CloudFormation template that defines the user requested stack

stack_result = cf_client.create_stack(
    StackName='foobar', 
    TemplateURL='https://naitsirc.s3.amazonaws.com/foo.yaml'
)

print(stack_result)