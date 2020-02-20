import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as Confidential from './confidential.json';
import { Template } from './template';


@Injectable({
  providedIn: 'root'
})
export class AWSClientService {
  private url = Confidential['url'];
  private headers = {
    headers: new HttpHeaders({
      'x-api-key': Confidential['x-api-key']
    })
  }

  constructor(private http:HttpClient) { }

  createInstance(instanceType: string, machineImage: string) {
    return this.http.post<string>(
      this.url+"/instances",
      {
        type: instanceType,
        ami: machineImage,
        minCount: "1",
        maxCount: "1"
      },
      this.headers
    );
  }

  createProject(name: string, owner: string, description: string) {
    return this.http.post<string>(
      this.url+"/projects",
      {
        name: name,
        owner: owner,
        description: description
      },
      this.headers
    );
  }

  createStack(name: string, template: Template) {
    return this.http.post<string>(
      this.url+"/stacks",
      {
        name: name,
        template: template.json,
        keys: JSON.stringify(template.keys)
      },
      this.headers
    )
  }

  getInstances() {
    return this.http.get<string>(
      this.url+"/instances",
      this.headers
    )
  }

  getProjects() {
    return this.http.get<string>(
      this.url+"/projects",
      this.headers
    )
  }
}
