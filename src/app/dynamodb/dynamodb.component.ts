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
  @ViewChild('instanceTypeSelect', { static: true }) private instanceTypeSelect: ElementRef;
  @ViewChild('machineImageSelect', { static: true }) private machineImageSelect: ElementRef;
  @ViewChild('keyPairActionSelect', { static: true }) private keyPairActionSelect: ElementRef;
  @ViewChild('fileInput', { static: true }) fileInput: ElementRef;
  @ViewChild('fileName', { static: true }) fileName: ElementRef;

  private createForm: FormGroup;
  private initialFormValues = null;
  private isLoading: Boolean = false;

  // private keyName: string = null;

  constructor(private client: AWSClientService, private notifications: NotificationService, private fb: FormBuilder) {
    this.notifications.DynamoDBCreated.subscribe(data => {
      this.isLoading = false;
    });
  }

  ngOnInit() {
    this.createForm = this.fb.group({
      'tableName': new FormControl("", Validators.required),
      'readCapacityUnits': new FormControl("1", Validators.required),
      'writeCapacityUnits': new FormControl("1", Validators.required),
      'attributesDefinition': this.fb.array([this.initItems()])
    });
  }

  ngAfterViewInit() {
  }

  onSubmit() {
    // this.isLoading = true;
    // this.create.emit(this.createForm.value);
    // this.resetForm();
  }

  resetForm() {
    // this.createForm.reset(this.initialFormValues);
    //
    // this.createForm.patchValue({
    //   logicalId: this.getRandID(),
    //   keyName: this.getRandID()
    // });
    //
    // // Reset controls not part of FormGroup manually
    // this.createNewKeyPair = false;
    // this.fileInput.nativeElement.value = "";
    // this.fileName.nativeElement.value = "";
  }

  get attributesDefinition() : FormArray {
    return <FormArray> this.createForm.get('attributesDefinition')
  }

  addAttributesDefinition() {
    this.attributesDefinition.push(this.initItems());
  }

  initItems(): FormGroup {
    return this.fb.group({
      attributeName: [null],
      attributeType: [null]
    });
  }

  getRandID(): string { return Math.random().toString(36).substring(2, 15) };
}
