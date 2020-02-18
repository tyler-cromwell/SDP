import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('instanceTypeSelect', {static:true}) instanceTypeSelect: ElementRef;
  @ViewChild('machineImageSelect', {static:true}) machineImageSelect: ElementRef;

  constructor(private client: AWSClientService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    M.FormSelect.init(this.instanceTypeSelect.nativeElement, {});    
    M.FormSelect.init(this.machineImageSelect.nativeElement, {});    
  }

  onSubmit(form: NgForm) {
    let {name, instanceType, keyName, machineImage} = form.value;    
    let template: Template = new Template();
    template.addEC2Instance(name, instanceType, keyName, machineImage);
    this.client.postStack("test13", template).subscribe(
      data => {
        console.log("posted stack!")
        console.log(JSON.parse(data))
      }
    );
  }
}
