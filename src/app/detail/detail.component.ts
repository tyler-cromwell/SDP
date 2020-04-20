import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { ActivatedRoute } from '@angular/router'

import * as M from "materialize-css/dist/js/materialize";
import { AWSClientService, NotificationService, LoggingService } from 'src/services/services';
import { Project, EC2, DynamoDB } from 'src/models/Models';
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

  private isLoadingDynamoDBInstances: Boolean = false;
  private newDynamoDBInstance: Boolean = null;
  private dynamoDBInstances: any;

  constructor(private activatedRoute: ActivatedRoute,
              private client: AWSClientService,
              private notifications: NotificationService,
              private logger: LoggingService)
  {
    this.logger.logs.subscribe(log => {
      console.log(`[${log.src}] ${log.message}`, log.obj);
    });
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      let projectName = params['id'];
      this.client.getProject(projectName).subscribe(data => {
        this.logger.log(
          this.logSrc,
          `Initalizing project with template:`,
          data
        );
        this.project = data[0];
      });
    });
  }

  ngAfterViewInit() {
    M.Tabs.init(document.querySelectorAll('.tabs'), {});
    M.Collapsible.init(document.querySelectorAll('.collapsible'), {});
  }

  async onDynamoCreate(DynamoTableInstance: DynamoDB) {
    let { tableName, readCapacityUnits, writeCapacityUnits, attributeDefinitions, keySchema } = DynamoTableInstance;

    this.logger.log(
      this.logSrc,
      `Captured create event from DynamoTableInstance for instance:`,
      DynamoTableInstance
    );

    let template = new Template(this.project.name);
    template.json = this.project.template;

    /*
     * Stacks cannot be created without at least one resource.
     * So check if any already exist in the template.
     */
    let create: Boolean = template.isEmpty();
    let stackName: string = this.project.name.replace(/\s/g, '');

    // console.log(tableName, readCapacityUnits, writeCapacityUnits, keySchema, attributeDefinitions)

    template.addDynamoDBTable(
      this.project.id,
      {
        tableName,
        readCapacityUnits,
        writeCapacityUnits,
        keySchema,
        attributeDefinitions
      }
    );

    this.logger.log(
      this.logSrc,
      `Project template AFTER adding DynamoTableInstance instance:`,
      this.project.template
    );

    let response = null;

    if (create) {
      this.logger.log(this.logSrc, `CREATE NEW stack with this template`, template.json);
      response = await this.client.createStack(stackName, template).toPromise();
      this.logger.log(this.logSrc, `Create stack response:`, response);
    } else {
      this.logger.log(this.logSrc, 'UPDATE stack with new template', template.json);
      response = await this.client.updateStack(stackName, template).toPromise();
      this.logger.log(this.logSrc, `Update stack response:`, response);
    }

    // if create / update stack operation was succesful
    if ('statusCode' in response && response['statusCode'] === "200") {
      console.log('BEFORE ADDING DYNAMO TABLE NAME', this.project.dynamoTables);
      let dynamoTablesArg: string[] = this.project.dynamoTables;
      dynamoTablesArg.push(stackName + tableName)
      this.project.dynamoTables = dynamoTablesArg;
      console.log('AFTER ADDING DYNAMO TABLE NAME', this.project.dynamoTables);
      // Update the project in ProjectsTable if everything is successful
      this.client.updateProject(this.project).subscribe();


      this.project.template = template.json;

      // emit notification to indicate creation of new EC2 instance
      this.notifications.DynamoDBCreated.emit(response);

      this.newDynamoDBInstance = true;
    } else {
      this.notifications.DynamoDBCreated.emit(response);
    }
  }

  async onEC2Create(EC2Instance: EC2) {
    let { logicalId, instanceType, keyName, machineImage, userData } = EC2Instance;

    this.logger.log(
      this.logSrc,
      `Captured create event from EC2 component for instance:`,
      EC2Instance
    );

    let template = new Template(this.project.name);
    template.json = this.project.template;

    this.logger.log(
      this.logSrc,
      `Project template BEFORE adding EC2 instance:`,
      this.project.template
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
      `project template AFTER adding EC2 instance:`,
      this.project.template
    );

    let response = null;

    if (create) {
      this.logger.log(this.logSrc, `CREATE NEW stack with this template`);
      response = await this.client.createStack(stackName, template).toPromise();
      this.logger.log(this.logSrc, `Create stack response:`, response);
    } else {
      this.logger.log(this.logSrc, 'UPDATE stack with new template');
      response = await this.client.updateStack(stackName, template).toPromise();
      this.logger.log(this.logSrc, `Update stack response:`, response);
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

  onDynamoDBView() {
    this.isLoadingDynamoDBInstances = true;
    let tableNames = this.project.dynamoTables
    this.client.getDynamoDBResources(this.project.id, tableNames).subscribe(data => {
      this.dynamoDBInstances = data;
      console.log(`[PROJECT DETAILS] DynamoDB Tables:`, this.dynamoDBInstances)
      this.isLoadingDynamoDBInstances = false;
      setTimeout(() => {
        this.newDynamoDBInstance = false;
      }, 2000);
    });
  }

  onEC2View() {
    this.isLoadingEC2Instances = true;
    this.client.getEC2Resources(this.project.id).subscribe(data => {
      this.ec2Instances = data["Reservations"]
      console.log(`[PROJECT DETAILS] EC2 Instances:`, this.ec2Instances)
      this.isLoadingEC2Instances = false;
      setTimeout(() => {
        this.newEC2Instance = false;
      }, 2000);
    });
  }
}
