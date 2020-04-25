import { EC2, DynamoDB } from 'src/models/Models';

export class Template {
  stackName: string;
  json: object;

  constructor(name: string, description: string = "", version: string = "2010-09-09") {
    this.stackName = name;
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

  private templateHasEC2Instance(): Boolean {
    for (let resourceName in this.json["Resources"]) {
      if (resourceName["Type"] === "AWS::EC2::Instance") return true;
    }
    return false;
  }

  public addEC2Instance(projectId: string, instance: EC2) {
    let fullId: string = this.stackName + instance.logicalId;
    let fullKeyName: string = this.stackName + instance.keyName;

    this.json["Resources"][fullId] = {
      "Type": "AWS::EC2::Instance",
      "Properties": {
        "KeyName": fullKeyName,
        "ImageId": instance.machineImage,
        "InstanceType": instance.instanceType,
        "Tags" : [
          {
            "Key": "Name",
            "Value": fullId
          },
          {
            "Key" : "ProjectName",
            "Value" : projectId
          }
        ]
      }
    }

    // "userData" parameter must not be an empty string or null, otherwise DynamoDB will throw error.
    if (instance.userData !== null && instance.userData !== '') {
      this.json["Resources"][fullId]["Properties"]["UserData"] = {
        "Fn::Base64": instance.userData
      }
    }

    // Add EC2 instance security group to enable SSH access
    if (!this.templateHasEC2Instance()) {
      this.json["Resources"]["InstanceSecurityGroup"] = {        
        "Type" : "AWS::EC2::SecurityGroup",
        "Properties" : {
          "GroupDescription": "Enable SSH access via port 22",
          "SecurityGroupIngress": {
            "IpProtocol": "tcp",
            "FromPort": "22",
            "ToPort": "22",
            "CidrIp": "0.0.0.0/0"
          }
        }        
      }      
    }

    this.json["Resources"][fullId]["Properties"]["SecurityGroups"] = [ {"Ref" : "InstanceSecurityGroup"} ];
  }

  public addDynamoDBTable(projectId: string, instance: DynamoDB) {
    let fullName: string = this.stackName + instance.tableName;

    this.json["Resources"][fullName] = {
      "Type": "AWS::DynamoDB::Table",
      "Properties": {
        "AttributeDefinitions": instance.attributeDefinitions,
        "KeySchema": instance.keySchema,
        "ProvisionedThroughput": {
          "ReadCapacityUnits": instance.readCapacityUnits.toString(),
          "WriteCapacityUnits": instance.writeCapacityUnits.toString()
        },
        "TableName": fullName,
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
