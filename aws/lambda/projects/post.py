import json
import uuid
import boto3
from boto3.dynamodb.conditions import Key, Attr


dynamodb = boto3.resource('dynamodb')


class Project:
    name: str
    owner: str
    description: str
    version: str

    def __init__(self, event):
        self.name = event['name']
        self.owner = event['owner']
        self.description = event['description']
        self.version = event['version']


def get_missing_keys(required_keys, actual_keys):
    missing_keys = []
    for key in required_keys:
        if key not in actual_keys:
            missing_keys.append(key)
    return missing_keys


def isOwnerValid(project: Project) -> bool:
    table = dynamodb.Table('UsersTable')
    result = table.scan(
        FilterExpression=Attr('email').eq(project.owner)
    )
    return len(result["Items"]) == 1


def isProjectValid(project: Project) -> bool:
    table = dynamodb.Table('ProjectsTable')
    result = table.scan(
        FilterExpression=Key('name').eq(
            project.name) & Key('owner').eq(project.owner)
    )
    return True if result["Count"] == 0 else False


def build_response(error_msg: str, status_code: str):
    return {
        "ErrorMessage": error_msg,
        "StatusCode": status_code
    }

def main(event, context):
    table = dynamodb.Table('ProjectsTable')

    required = ['name', 'owner', 'description', 'version']

    missing_keys = get_missing_keys(required, event.keys())

    if len(missing_keys) > 0:
        return build_response("Missing require keys: {}".format(missing_keys), "400")

    project: Project = Project(event)

    if not isOwnerValid(project):
        return build_response("Owner does not exist", "400")

    if not isProjectValid(project):
        return build_response(
            "Bad Request (project '{}' with project owner '{}' already exist)".format(project.name, project.owner),
            "400"
        )

    projectId: str = str(uuid.uuid1())

    result = table.put_item(
        Item={
            'id': projectId,
            'name': event['name'],
            'owner': event['owner'],
            'description': event['description'],
            'version': event['version']
        }
    )

    result = table.query(
        KeyConditionExpression=Key('id').eq(projectId)
    )

    return result["Items"][0]
