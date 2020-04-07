import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

import * as M from "materialize-css/dist/js/materialize";
import { AWSClientService } from 'src/services/awsclient.service';
import { NotificationService } from 'src/services/notification.service';
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
  private createNewKeyPair: Boolean = true;
  private initialFormValues = null;
  private isLoading: Boolean = false;

  private receivedRSAPrivateKeyPair: Boolean = false;
  private RSAPrivateKey: string = null;
  private keyName: string = null;

  constructor(private client: AWSClientService, private notifications: NotificationService) {
    this.notifications.EC2Created.subscribe(data => {      
      this.isLoading = false;      
    });
    this.notifications.RSAPrivateKey.subscribe(data => {      
      this.receivedRSAPrivateKeyPair = true;
      this.RSAPrivateKey = data["KeyMaterial"];
      this.keyName = data["KeyName"];
      console.log("[PROJECT DETAILS] Received RSA key: " + this.RSAPrivateKey);
    });
  }

  ngOnInit() { 
    this.createForm = new FormGroup({
      'logicalId': new FormControl(this.getRandID(), Validators.required),
      'instanceType': new FormControl(this.instanceTypes[0]),
      'keyName': new FormControl(this.getRandID(), Validators.required),
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
    this.isLoading = true; 
    console.log(this.createForm.value);
    this.create.emit(this.createForm.value);

    this.createForm.reset(this.initialFormValues);

    this.createForm.patchValue({
      logicalId: this.getRandID(),
      keyName: this.getRandID()
    });

    // Reset controls not part of FormGroup manually
    this.createNewKeyPair = false;
    this.fileInput.nativeElement.value = "";
    this.fileName.nativeElement.value = "";        
  }

  onRSAPrivateKeyDownload() {
    let blob = new Blob([this.RSAPrivateKey], { type: 'text/plain' });
    var url = window.URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    anchor.download = this.keyName+'.pem';
    anchor.href = url;
    anchor.click();

    // Clear RSA private key data after download
    this.receivedRSAPrivateKeyPair = false;
    this.RSAPrivateKey = null;
    this.keyName = null;
  }

  getRandID(): string { return Math.random().toString(36).substring(2, 15) };
}
