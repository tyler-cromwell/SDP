import string
import random
import boto3

def lambda_handler(event, context):
  cf_client = boto3.client('cloudformation')
  
  location = event["Records"][0]["s3"]["bucket"]["name"]
  key = event["Records"][0]["s3"]["object"]["key"]
  url = "https://{}.s3.amazonaws.com/{}".format(location, key)
  
  print("location: {}".format(location))
  print("key: {}".format(key))
  print("url: {}".format(url))
  
  cf_client = boto3.client('cloudformation')
  stack_result = cf_client.create_stack(
    StackName = get_stack_name(), # name of stack, must be unique
    TemplateURL = url # the URL of the CloudFormation template that defines the user requested stack
  )
  
  print(stack_result)
  
def get_stack_name(length=20):
  store = string.ascii_letters + string.digits
  return random.choice(string.ascii_letters) + ''.join([random.choice(store) for i in range(length - 1)])
