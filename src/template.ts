import { Injectable } from '@angular/core';

import * as AWS from 'aws-sdk';


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

  createStack(stack_name: string) {
    var response = {}
    var cfclient = new AWS.CloudFormation();
    var ec2client = new AWS.EC2();

    for (var name of this.keys) {
      var result = ec2client.describeKeyPairs(
        {
          KeyNames: [name]
        },
        (err, data) => {
          if (err) {
            console.log(err, err.stack);
          }
        }
      );

      if (result['KeyPairs'].length == 0) {
        response[name] = ec2client.createKeyPair(
          {
            KeyName: name
          },
          (err, data) => {
            if (err) {
              console.log(err, err.stack);
            }
          }
        );
      }
    }

    response[stack_name] = cfclient.createStack(
      {
        StackName: stack_name,
        TemplateBody: JSON.stringify(this.json)
      },
      (err, data) => {
        if (err) {
          console.log(err, err.stack);
        }
      }
    );

    return response;
  }
}
