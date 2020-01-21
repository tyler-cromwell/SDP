import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as Confidential from './confidential.json';


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

  getInstances() {
    return this.http.get<string>(this.url+"/test", this.headers)
  }

  postInstances() {
    return this.http.post<string>(
      this.url+"/test",
      {
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
