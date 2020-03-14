import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import * as M from "materialize-css/dist/js/materialize";
import { NgForm } from '@angular/forms';
import { AWSClientService } from 'src/awsclient.service';
import { Template } from 'src/template'

@Component({
  selector: 'app-ec2',
  templateUrl: './ec2.component.html',
  styleUrls: ['./ec2.component.css']
})
export class Ec2Component implements OnInit {
  @Input() projectId: string = "qwe12re1";
  @Output() ec2Created: EventEmitter<any> = new EventEmitter();
  @ViewChild('instanceTypeSelect', {static:true}) instanceTypeSelect: ElementRef;
  @ViewChild('machineImageSelect', {static:true}) machineImageSelect: ElementRef;

  private ec2Name: string = this.randomString();
  private ec2KeyPair: string = "OurEC2Keypair01";
  private instanceTypes: string[] = ["t2.micro"];
  private machineImages: string[] = ["ami-0e38b48473ea57778"];

  randomString(): string {
    return Math.random().toString(36).substring(7);
  }

  constructor(private client: AWSClientService) { }

  ngOnInit() { }

  ngAfterViewInit() {
    M.FormSelect.init(this.instanceTypeSelect.nativeElement, {});    
    M.FormSelect.init(this.machineImageSelect.nativeElement, {});    
    setTimeout(() => {
      M.updateTextFields();
    }, 100);
  }

  onSubmit(form: NgForm) {
    let {name, instanceType, keyName, machineImage} = form.value;   
    console.log("name = " + name);
    console.log("instance type = " + instanceType);
    console.log("key name = " + keyName);
    console.log("machine Image = " + machineImage);
    // let template: Template = new Template();
    // template.addEC2Instance(name, instanceType, keyName, machineImage);
    // this.client.createStack(this.randomString(), template).subscribe(
    //   data => {
    //   }
    // );
    this.ec2Created.emit({
      projectId: this.projectId,
      name,
      instanceType,
      machineImage,
      keyName
    });
  }
}
