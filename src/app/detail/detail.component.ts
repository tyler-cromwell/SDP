import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import * as M from "materialize-css/dist/js/materialize";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {
  private projectId: string;
  private newEC2InstanceCount: number;
  private ec2Instances: any;

  constructor(private activatedRoute: ActivatedRoute) {
    this.newEC2InstanceCount = 0;
    this.ec2Instances = [];
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.projectId = params['id'];
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
    this.newEC2InstanceCount += 1;
  }

  onEC2View() {
    // load EC2 resources for projectId
    setTimeout(() => {
      this.newEC2InstanceCount = 0;
    }, 1000);
  }
}
