import json
import boto3

def main(event, context):
  dynamodb = boto3.resource('dynamodb')
  table = dynamodb.Table('cse4940-projects')
  result = table.scan(
    Select="ALL_ATTRIBUTES"
  )
  return result["Items"]