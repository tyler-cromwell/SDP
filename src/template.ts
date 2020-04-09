import { EC2, DynamoDB } from 'src/models/Models';

export class Template {
  json: object;

  constructor(description: string = "", version: string = "2010-09-09") {
    this.json = {
      "AWSTemplateFormatVersion": version,
      "Description": description,
      "Resources": {},
      "Outputs": {},
    };
  }

  public isEmpty(): Boolean {
    return Object.keys(this.json['Resources']).length == 0
  }

  public addLambdaFunction(name: string, handler: string, role: string, code: string, runtime: string) {
    this.json["Resources"][name] = {
      "Type": "AWS::Lambda::Function",
      "Properties" : {
        "Code": {
          "ZipFile": code
        }
      },
      "Handler": handler,
      "Role": role,
      "Runtime": runtime,
    }
  }

  public addEC2Instance(projectId: string, instance: EC2) {
    this.json["Resources"][instance.logicalId] = {
      "Type": "AWS::EC2::Instance",
      "Properties": {
        "KeyName": instance.keyName,
        "ImageId": instance.machineImage,
        "InstanceType": instance.instanceType,
        "Tags" : [
          {
            "Key": "Name",
            "Value": instance.logicalId
          },
          {
            "Key" : "ProjectName",
            "Value" : projectId
          }
        ]
      }
    }

    // if (instance.keyName !== null) {
    //   this.json["Resources"][instance.logicalId]["Properties"]["KeyName"] = instance.keyName;
    // }

    // "userData" parameter must not be an empty string or null, otherwise DynamoDB will throw error.
    if (instance.userData !== null && instance.userData !== '') {
      this.json["Resources"][instance.logicalId]["Properties"]["UserData"] = {
        "Fn::Base64": instance.userData
      }
    }
  }

  public addDynamoDBTable(projectId: string, instance: DynamoDB) {
    this.json["Resources"][instance.tableName] = {
      "Type": "AWS::DynamoDB::Table",
      "Properties": {
        "AttributeDefinitions": instance.attributeDefinitions,
        "KeySchema": instance.keySchema,
        "ProvisionedThroughput": {
          "ReadCapacityUnits": instance.readCapacityUnits.toString(),
          "WriteCapacityUnits": instance.writeCapacityUnits.toString()
        },
        "TableName": instance.tableName,

        "Tags" : [
          {
            "Key" : "ProjectName",
            "Value" : projectId
          }
        ]
      }
    }
  }
}
