import json
import datetime

import boto3

def formatTableData(oldTable):
    newTable = {}
    newTable['AttributeDefinitions'] = oldTable['AttributeDefinitions']
    newTable['TableName'] = oldTable['TableName']
    newTable['KeySchema'] = oldTable['KeySchema']
    newTable['TableStatus'] = oldTable['TableStatus']
    newTable['WriteCapacityUnits'] = oldTable['ProvisionedThroughput']['WriteCapacityUnits']
    newTable['ReadCapacityUnits'] = oldTable['ProvisionedThroughput']['ReadCapacityUnits']
    newTable['ItemCount'] = oldTable['ItemCount']
    newTable['TableArn'] = oldTable['TableArn']
    return newTable

def main(event, context):
    print(event)
    if 'projectName' not in event['queryStringParameters']:
        print('Not a real project')
        return {
            'headers': { 'access-control-allow-origin': '*' },
            'statusCode': 400,
            'body': '[]'
        }
    elif 'multiValueQueryStringParameters' not in event or 'tableNames' not in event['multiValueQueryStringParameters']:
        print('tableNames error')
        return {
            'headers': { 'access-control-allow-origin': '*' },
            'statusCode': 400,
            'body': '[]'
        }
    # print(event)
    projectName = event['queryStringParameters']['projectName']
    tableNames = event['multiValueQueryStringParameters']['tableNames']

    client = boto3.client('dynamodb')

    def myconverter(o):
        if isinstance(o, datetime.datetime):
            return o.__str__()

    tables = []
    print('Table names are: ', tableNames)

    for tableName in tableNames:
        print(str(tableName))
        table = client.describe_table(
            TableName=str(tableName)
            )['Table']
        print('Table is: ', table)
        tables.append(formatTableData(table))

    print(tables)

    return {
        'statusCode': 200,
        'headers': { 'access-control-allow-origin': '*' },
        'body': json.dumps(tables)
    }
