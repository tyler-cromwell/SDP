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

  getProjects() {
    return this.http.get<string>(this.url+"/projects", this.headers)
  }

  async postStack(name: string, template: Template) {
    return await this.http.post<string>(
      this.url+"/stacks",
      {
        name: name,
        template: template.json,
        keys: JSON.stringify(template.keys)
      },
      this.headers
    ).toPromise()
  }

  getInstances() {
    return this.http.get<string>(this.url+"/instances", this.headers)
  }

  postInstances() {
    return this.http.post<string>(
      this.url+"/instances",
      {
        ami: "ami-04b9e92b5572fa0d1",
        type: "t2.micro",
        minCount: "1",
        maxCount: "1"
      },
      this.headers
    );
  }

  postProject(name: string, owner: string, description: string) {
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
}
