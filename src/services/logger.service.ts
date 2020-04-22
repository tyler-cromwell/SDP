import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class LoggingService {
  public logs = new EventEmitter<object>();  

  constructor() { }

  public log(src: string, message: string, obj: object = {}): void {
    this.logs.emit({ src, message, obj});
  }
}
