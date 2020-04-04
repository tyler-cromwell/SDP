import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import * as M from "materialize-css/dist/js/materialize";
import { AWSClientService } from 'src/awsclient.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {
  private project: object;
  private projectName: string;
  private newEC2InstanceCount: number = 0;
  private ec2Instances: any = null;
  private isLoadingEC2: boolean = false;

  constructor(private activatedRoute: ActivatedRoute, private client: AWSClientService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.projectName = params['id'];
    });
    this.client.getProject(this.projectName).subscribe(data => {
      this.project = data[0];
    });
  }

  ngAfterViewInit() {
    let tabs = document.querySelectorAll('.tabs');
    M.Tabs.init(tabs, {});
    let elems = document.querySelectorAll('.collapsible');
    M.Collapsible.init(elems, {});
  }

  ec2Created(ec2Instance) {
    let { name, projectId, machineImage, keyName, instanceType, userData, state } = ec2Instance;
    this.client.postEC2Instance(name, projectId, machineImage, keyName, instanceType, userData, state).subscribe();
    this.newEC2InstanceCount += 1;
  }

  onEC2View() {
    this.isLoadingEC2 = true; 
    this.client.getEC2Resources(this.project['name']).subscribe(data => {
      this.ec2Instances = data;
      this.isLoadingEC2 = false;
      this.ec2Instances = data.Reservations
      console.log(this.ec2Instances)
    });
    setTimeout(() => {
      this.newEC2InstanceCount = 0;
    }, 1000);
  }
}
