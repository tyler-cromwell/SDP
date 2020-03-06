export class Template {
  json: object;
  keys: string[];

  constructor(description: string = "", version: string = "2010-09-09") {
    this.json = {
      "AWSTemplateFormatVersion": version,
      "Description": description,
      "Resources": {},
      "Outputs": {},
    };
    this.keys = [];
  }

  addEC2Instance(name: string, instanceType: string, keyName: string, machineImage: string, userData: string = "") {
    if (this.keys.indexOf(keyName) == -1) {
      this.keys.push(keyName);
    }

    this.json["Resources"][name] = {
      "Type": "AWS::EC2::Instance",
      "Properties": {
        "ImageId": machineImage,
        "InstanceType": instanceType,
        "KeyName": keyName,
        "UserData": {
          "Fn::Base64": userData
        }
      }
    };

    this.json["Outputs"]["InstanceId"] = {
      "Value": {
        "Ref": name
      }
    };
    this.json["Outputs"]["AvailabilityZone"] = {
      "Value": {
        "Fn::GetAtt": [name, "AvailabilityZone"]
      }
    };
    this.json["Outputs"]["PublicDns"] = {
      "Value": {
        "Fn::GetAtt": [name, "PublicDnsName"]
      }
    };
    this.json["Outputs"]["PublicIp"] = {
      "Value": {
        "Fn::GetAtt": [name, "PublicIp"]
      }
    };
  }
}
