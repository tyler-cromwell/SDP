import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

import * as M from "materialize-css/dist/js/materialize";
import { AWSClientService } from 'src/awsclient.service';
import { Project } from 'src/models/Project';

@Component({
  selector: 'app-ec2',
  templateUrl: './ec2.component.html',
  styleUrls: ['./ec2.component.css']
})
export class Ec2Component implements OnInit {
  @Input() private project: Project;
  @Output() private create: EventEmitter<any> = new EventEmitter();
  @ViewChild('instanceTypeSelect', { static: true }) private instanceTypeSelect: ElementRef;
  @ViewChild('machineImageSelect', { static: true }) private machineImageSelect: ElementRef;
  @ViewChild('keyPairActionSelect', { static: true }) private keyPairActionSelect: ElementRef;  
  @ViewChild('fileInput', { static: true }) fileInput: ElementRef;
  @ViewChild('fileName', { static: true }) fileName: ElementRef;
  
  private createForm: FormGroup;
  private instanceTypes: string[] = ["t2.micro"];
  private machineImages: string[] = ["ami-0e38b48473ea57778"];
  private createNewKeyPair: Boolean = false;
  private initialFormValues = null;

  constructor(private client: AWSClientService) { }

  ngOnInit() { 
    this.createForm = new FormGroup({
      'logicalId': new FormControl(null, Validators.required),
      'instanceType': new FormControl(this.instanceTypes[0]),
      'keyName': new FormControl(null),
      'machineImage': new FormControl(this.machineImages[0]),
      'userData': new FormControl(null)
    });    
  }

  ngAfterViewInit() {
    M.FormSelect.init(this.instanceTypeSelect.nativeElement, {});    
    M.FormSelect.init(this.machineImageSelect.nativeElement, {});
    M.FormSelect.init(this.keyPairActionSelect.nativeElement, {});
    M.updateTextFields();    
    this.initialFormValues = this.createForm.value;
  }

  onFileChange(e) {
    let file = e.target.files[0];
    let fileReader = new FileReader();
    fileReader.readAsText(file);

    fileReader.onloadend = (e) => {
      this.createForm.patchValue({
        'userData': fileReader.result
      });      
    };
  }

  onSubmit() {    
    console.log(this.createForm.value);
    this.create.emit(this.createForm.value);  

    this.createForm.reset(this.initialFormValues);

    // Reset controls not part of FormGroup manually
    this.createNewKeyPair = false;
    this.fileInput.nativeElement.value = "";
    this.fileName.nativeElement.value = "";
  }
}
