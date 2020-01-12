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

  getInstances() {
    return this.http.get(this.url, this.headers)
  }

  postInstances() {
    return this.http.post(
      this.url,
      {
        type: "t2.micro",
        minCount: "1",
        maxCount: "1"
      },
      this.headers
    );
  }
}
