import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class NotificationService {
  public EC2Created = new EventEmitter<any>();
  public DynamoDBCreated = new EventEmitter<any>();  
  public RSAPrivateKey = new EventEmitter<any>();

  constructor() { }
}
