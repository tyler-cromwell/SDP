import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';

import * as M from "materialize-css/dist/js/materialize";
import { AWSClientService } from 'src/services/awsclient.service';
import { NotificationService } from 'src/services/notification.service';
import { Project } from 'src/models/Project';

@Component({
  selector: 'app-dynamodb',
  templateUrl: './dynamodb.component.html',
  styleUrls: ['./dynamodb.component.css']
})
export class DynamodbComponent implements OnInit {
  @Input() private project: Project;
  @Output() private create: EventEmitter<any> = new EventEmitter();
  @ViewChild('attributeTypeSelect', { static: false }) private attributeTypeSelect: ElementRef;
  @ViewChild('keyTypeSelect', { static: false }) private keyTypeSelect: ElementRef;

  private dataTypes: string[] = ["N", "S", "B"];
  private keyTypes: string[] = ["HASH", "RANGE"];

  private createForm: FormGroup;
  private initialValues: object = null;
  private isLoading: Boolean = false;

  constructor(private client: AWSClientService, private notifications: NotificationService, private fb: FormBuilder) {
    this.notifications.DynamoDBCreated.subscribe(data => {
      this.isLoading = false;
    });
  }

  ngOnInit() {
    this.createForm = new FormGroup({
      'tableName': new FormControl(null, Validators.required),
      'readCapacityUnits': new FormControl(1, Validators.required),
      'writeCapacityUnits': new FormControl(1, Validators.required),
      'attributeDefinitions': this.fb.array([this.initItems('attributes')]),
      'keySchema': this.fb.array([this.initItems('keys')])
    });
    this.initialValues = this.createForm.value;
  }

  ngAfterViewInit() {
    M.FormSelect.init(this.attributeTypeSelect.nativeElement, {});
    M.FormSelect.init(this.keyTypeSelect.nativeElement, {});
    M.updateTextFields();
  }

  onSubmit() {
    this.isLoading = true;
    console.log("Value of this form is: ", this.createForm.value);
    this.create.emit(this.createForm.value);
    this.resetForm();
  }

  resetForm() {
    this.createForm.reset();
  }

  get attributeDefinitions() : FormArray {
    return <FormArray> this.createForm.get('attributeDefinitions')
  }

  get keySchema() : FormArray {
    return <FormArray> this.createForm.get('keySchema')
  }

  addAttributesDefinition() {
    this.attributeDefinitions.push(this.initItems('attributes'));
  }

  addKey() {
    this.keySchema.push(this.initItems('keys'));
  }

  initItems(type): FormGroup {
    if (type == 'attributes') {
      return this.fb.group({
        AttributeName: [null],
        AttributeType: this.dataTypes[0]
      });
    } else if (type == 'keys') {
      return this.fb.group({
        AttributeName: [null],
        KeyType: this.keyTypes[0]
      })
    }
  }
}
