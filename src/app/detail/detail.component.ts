import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { ActivatedRoute } from '@angular/router'

import * as M from "materialize-css/dist/js/materialize";
import { AWSClientService } from 'src/services/awsclient.service';
import { NotificationService } from 'src/services/notification.service';
import { Project, EC2 } from 'src/models/Models';
import { Template } from 'src/template';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {  
  private project: Project;  

  private ec2Instances: object[] = null;
  private isLoadingEC2Instances: Boolean = false;
  private newEC2Instance: Boolean = null;

  constructor(private activatedRoute: ActivatedRoute, 
    private client: AWSClientService, 
    private notifications: NotificationService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {      
      let projectName = params['id'];
      this.client.getProject(projectName).subscribe(data => {    
        console.log(`[PROJECT DETAILS] initalizing details component with project: 
          ${JSON.stringify(data, null, 4)}`);    
        this.project = data[0];        
      });
    });
  }

  ngAfterViewInit() {    
    M.Tabs.init(document.querySelectorAll('.tabs'), {});    
    M.Collapsible.init(document.querySelectorAll('.collapsible'), {});
  }

  onEC2Create(EC2Instace: EC2) {
    let { logicalId, instanceType, keyName, machineImage, userData } = EC2Instace;        
    
    console.log(`[PROJECT DETAILS] captured create event from EC2 component for instance: 
      ${JSON.stringify(EC2Instace, null, 4)}`);       

    let template = new Template();    
    template.json = this.project.template;

    console.log(`[PROJECT DETAILS] Template BEFORE adding EC2 instance: 
      ${JSON.stringify(this.project.template, null, 4)}`);

    /*
     * Stacks cannot be created without at least 1 resource,
     * So check if any already exist in the template.
     */    
    let create: Boolean = template.isEmpty();
    let stackName: string = this.project.name.replace(/\s/g, '');
    template.addEC2Instance(
      this.project.id, 
      {
        logicalId,
        instanceType,
        keyName,
        machineImage,
        userData
      }
    );    
    
    console.log(`[PROJECT DETAILS] Template AFTER adding EC2 instance: 
      ${JSON.stringify(this.project.template, null, 4)}`);      

    if (create) {
      console.log('[PROJECT DETAILS] this is a new project.. CREATE stack with this template');
      this.client.createStack(stackName, template).subscribe(data => {
        console.log(`[PROJECT DETAILS] create stack response: ${JSON.stringify(data, null, 4)}`);        
        this.synchronizeState(data, template);
      });
    } else {
      console.log('[PROJECT DETAILS] UPDATE stack with new template'); 
      this.client.updateStack(stackName, template).subscribe(data => {
        console.log(`[PROJECT DETAILS] update stack response: ${JSON.stringify(data, null, 4)}`);
        this.synchronizeState(data, template);        
      });
    }        
  }

  onEC2View() {
    this.isLoadingEC2Instances = true;
    this.client.getEC2Resources(this.project.id).subscribe(data => {
      console.log(`[PROJECT DETAILS] EC2 Resource data: \n${JSON.stringify(data, null, 4)}`)
      this.ec2Instances = data["Reservations"]      
      this.isLoadingEC2Instances = false;      
      setTimeout(() => { 
        this.newEC2Instance = false; 
      }, 2000);
    });
  }

  synchronizeState(data, template: Template) {    
    // if create / update stack operation was succesful
    if ('statusCode' in data && data['statusCode'] === "200") {
      // Update the project in ProjectsTable if everything is successful
      this.client.updateProject(this.project).subscribe();

      this.project.template = template.json;

      // emit notification to indicate creation of new EC2 instance
      this.notifications.EC2Created.emit(data);

      this.newEC2Instance = true;

      if (data["keys"].length > 0) {
        this.notifications.RSAPrivateKey.emit(data["keys"][0]);
      }      
    }
  }
}
