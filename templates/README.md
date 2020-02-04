The goal is to have a front-end form that a user can fill out to specify various AWS resources. The easiest to support (for now) will be EC2, S3, and DynamoDB. Once the user submits the form the front-end will make a request to a template builder tool that will build a `yaml` (or `json`) template that describes the user's requested resources as a CloudFormation template. CloudFormation will use this template to spawn all the resources. After getting the template from the "template-builder" service, the front-end will `POST` the template to a designated S3 bucket. Another service will listen for events that happen on this designated S3 bucket and will take the `POST`ed template and will use it to create a new stack in CloudFormation. The code below is the simplest way you can create a stack in CloudFormation using Python's `boto3`:

```
import boto3
cf_client = boto3.client('cloudformation')

# StackName: name of stack, can be dynamically generated, it must be unique
# TemplateURL: the URL of the CloudFormation template that defines the user requested stack

stack_result = cf_client.create_stack(
    StackName='foobar', 
    TemplateURL='https://naitsirc.s3.amazonaws.com/foo.yaml'
)

print(stack_result)
```
