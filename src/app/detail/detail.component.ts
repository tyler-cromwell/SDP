import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { ActivatedRoute } from '@angular/router'

import * as M from "materialize-css/dist/js/materialize";
import { AWSClientService, NotificationService, LoggingService } from 'src/services/services';
import { Project, EC2 } from 'src/models/Models';
import { Template } from 'src/template';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {  
  private project: Project;
  private readonly logSrc: string = 'PROJECT DETAILS';

  private ec2Instances: object[] = null;
  private isLoadingEC2Instances: Boolean = false;
  private newEC2Instance: Boolean = null;

  constructor(private activatedRoute: ActivatedRoute, 
              private client: AWSClientService, 
              private notifications: NotificationService,
              private logger: LoggingService) 
  { 
    this.logger.logs.subscribe(log => {
      console.log(`[${log.src}] ${log.message}`);
    });
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {      
      let projectName = params['id'];
      this.client.getProject(projectName).subscribe(data => {
        this.logger.log(
          this.logSrc,
          `initalizing project with the following template: \n${JSON.stringify(data, null, 4)}`
        );
        this.project = data[0];
      });
    });
  }

  ngAfterViewInit() {    
    M.Tabs.init(document.querySelectorAll('.tabs'), {});    
    M.Collapsible.init(document.querySelectorAll('.collapsible'), {});
  }

  async onEC2Create(EC2Instace: EC2) {
    let { logicalId, instanceType, keyName, machineImage, userData } = EC2Instace;        
        
    this.logger.log(
      this.logSrc, 
      `captured create event from EC2 component for instance: \n${JSON.stringify(EC2Instace, null, 4)}`
    );

    let template = new Template();    
    template.json = this.project.template;

    this.logger.log(
      this.logSrc, 
      `project template BEFORE adding EC2 instance: \n${JSON.stringify(this.project.template, null, 4)}`
    );

    /*
     * Stacks cannot be created without at least one resource.
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

    this.logger.log(
      this.logSrc, 
      `project template AFTER adding EC2 instance: \n${JSON.stringify(this.project.template, null, 4)}`
    );

    let response = null;

    if (create) {
      this.logger.log(this.logSrc, `this is a new project.. CREATE stack with this template`);
      response = await this.client.createStack(stackName, template).toPromise();
      this.logger.log(this.logSrc, `create stack response: ${JSON.stringify(response, null, 4)}`);
    } else {      
      this.logger.log(this.logSrc, 'UPDATE stack with new template');
      response = await this.client.updateStack(stackName, template).toPromise();
      this.logger.log(this.logSrc, `update stack response: ${JSON.stringify(response, null, 4)}`);      
    }

    // if create / update stack operation was succesful
    if ('statusCode' in response && response['statusCode'] === "200") {
      // Update the project in ProjectsTable if everything is successful
      this.client.updateProject(this.project).subscribe();

      this.project.template = template.json;

      // emit notification to indicate creation of new EC2 instance
      this.notifications.EC2Created.emit(response);

      this.newEC2Instance = true;

      if (response["keys"].length > 0) {
        this.notifications.RSAPrivateKey.emit(response["keys"][0]);
      }      
    } else {
      this.notifications.EC2Created.emit(response);
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
}
