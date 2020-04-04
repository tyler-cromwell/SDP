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

  isEmpty() {
    return Object.keys(this.json['Resources']).length == 0
  }

  addLambdaFunction(name: string, handler: string, role: string, code: string, runtime: string) {
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

  /*
   * "userData" parameter must not be an empty string (''), otherwise DynamoDB will not store it.
   */
  addEC2Instance(project_name: string, name: string, instanceType: string, keyName: string, machineImage: string, userData: string = "# Comment") {
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
        },
        "Tags" : [
          {
              "Key" : "ProjectName",
              "Value" : project_name
          }
        ]
      }
    };

    this.json["Outputs"]["InstanceId"] = {
      "Value": {
        "Ref": name
      }
    };
  }
}
