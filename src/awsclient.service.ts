import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as Confidential from './confidential.json';
import { Template } from './template';
import { Observable } from 'rxjs';
import { User } from './models/User';

@Injectable({
  providedIn: 'root'
})
export class AWSClientService {
  private url = Confidential['url'];
  private options: any = {
    headers: new HttpHeaders({
      'x-api-key': Confidential['x-api-key']
    })
  }

  constructor(private http: HttpClient) {}

////////////////////////////////////////////////////////////////////////////////
// /EC2Resources

  getEC2Resources(projectName: string) {
    this.options.params = { projectName };
    return this.http.get(
      this.url + "/EC2Resources",
      this.options
    )
  }

////////////////////////////////////////////////////////////////////////////////
// DynamoDB Resources
  // getDynamoDBResources(projectName: string) {
  //   this.options.params = { projectName };
  //   return this.http.get(
  //     this.url + "/DynamoDBResources",
  //     this.options
  //   )
  // }

////////////////////////////////////////////////////////////////////////////////
// Instances

  createInstance(instanceType: string, machineImage: string) {
    return this.http.post<string>(
      this.url + "/instances",
      {
        type: instanceType,
        ami: machineImage,
        minCount: "1",
        maxCount: "1"
      },
      this.options
    );
  }

  getInstances() {
    return this.http.get<string>(
      this.url + "/instances",
      this.options
    )
  }

  postEC2Instance(name: string, projectId: string, machineImage: string, keyName: string,
                  instanceType: string, userData: string, state: string) {
    let payload = { name, projectId, machineImage, keyName, instanceType, userData, state };
    return this.http.post<string>(
      this.url + "/EC2Resources",
      payload,
      this.options
    );
  }

////////////////////////////////////////////////////////////////////////////////
// /Projects

  createProject(name: string, owner: string, description: string, template: Template) {
    return this.http.post<string>(
      this.url + "/Projects",
      {
        name: name,
        owner: owner,
        description: description,
        version: "1.0.0",
        template: template.json
      },
      this.options
    );
  }

  // deleteProject(id: string) {
  //   return this.http.delete<string>(
  //     this.url + "/Projects",
  //     {
  //       id: id
  //     },
  //     this.options
  //   );
  // }

  getProjects() {
    return this.http.get<string>(
      this.url + "/Projects",
      this.options
    )
  }

  getProject(name: string) {
    this.options.params = { name }
    return this.http.get(
      this.url + "/Projects",
      this.options
    )
  }

  updateProject(id: string, name: string, owner: string, description: string, version: string, template: Template) {
    return this.http.put<string>(
      this.url + "/Projects",
      {
        id: id,
        name: name,
        owner: owner,
        description: description,
        version: version,
        template: template.json
      },
      this.options
    );
  }

////////////////////////////////////////////////////////////////////////////////
// /Stacks

  createStack(name: string, template: Template) {
    return this.http.post<string>(
      this.url + "/Stacks",
      {
        name: name,
        template: template.json
      },
      this.options
    )
  }

  updateStack(name: string, template: Template) {
    return this.http.put<string>(
      this.url + "/Stacks",
      {
        name: name,
        template: template.json
      },
      this.options
    )
  }

////////////////////////////////////////////////////////////////////////////////
// /Users

  postUser(user: User) {
    return this.http.post<string>(
      this.url + "/Users",
      user,
      this.options
    );
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.url + "/Users", <Object>this.options);
  }
}
