import { TestBed } from '@angular/core/testing';

import { AWSClientService } from './awsclient.service';

describe('AWSClientService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AWSClientService = TestBed.get(AWSClientService);
    expect(service).toBeTruthy();
  });
});
