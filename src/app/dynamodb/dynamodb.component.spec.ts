import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamodbComponent } from './dynamodb.component';

describe('DynamodbComponent', () => {
  let component: DynamodbComponent;
  let fixture: ComponentFixture<DynamodbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamodbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamodbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
