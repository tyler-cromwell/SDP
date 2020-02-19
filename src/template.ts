import { Injectable } from '@angular/core';


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

  addEC2Instance(name: string, instance_type: string, key_name: string, machine_image: string, user_data: string = "") {
    if (this.keys.indexOf(key_name) == -1) {
      this.keys.push(key_name);
    }

    this.json["Resources"][name] = {
      "Type": "AWS::EC2::Instance",
      "Properties": {
        "ImageId": machine_image,
        "InstanceType": instance_type,
        "KeyName": key_name,
        "UserData": {
          "Fn::Base64": user_data
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
