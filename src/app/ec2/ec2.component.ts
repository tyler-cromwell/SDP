import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as M from "materialize-css/dist/js/materialize";

@Component({
  selector: 'app-ec2',
  templateUrl: './ec2.component.html',
  styleUrls: ['./ec2.component.css']
})
export class Ec2Component implements OnInit {
  @ViewChild('instanceTypeSelect', {static:true}) instanceTypeSelect: ElementRef;
  @ViewChild('machineImageSelect', {static:true}) machineImageSelect: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    M.FormSelect.init(this.instanceTypeSelect.nativeElement, {});    
    M.FormSelect.init(this.machineImageSelect.nativeElement, {});    
  }

}
