import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import * as M from "materialize-css/dist/js/materialize";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {    
  private projectName: string;
  private ec2Instances = [];

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() { 
    this.activatedRoute.params.subscribe(params => {
      this.projectName = params['id'];      
    });
  }

  ngAfterViewInit() {    
    let tabs = document.querySelectorAll('.tabs');    
    M.Tabs.init(tabs, {});
    let elems = document.querySelectorAll('.collapsible');    
    M.Collapsible.init(elems, {});
  }

  ec2Created(ec2Instace) {
    this.ec2Instances.push(ec2Instace);    
  }
}
