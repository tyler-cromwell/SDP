import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as Confidential from './confidential.json';


@Injectable({
  providedIn: 'root'
})
export class AWSClientService {
  private url = Confidential['url'];

  constructor(private http:HttpClient) { }

  createEC2() {
    return this.http.post(
      this.url,
      {
        type: "t2.micro",
        minCount: "1",
        maxCount: "1"
      },
      {
        headers: new HttpHeaders({
          'x-api-key': Confidential['x-api-key']
        })
      }
    );
  }
}
