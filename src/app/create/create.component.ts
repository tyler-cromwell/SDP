import { Component, OnInit } from '@angular/core';

import * as M from "materialize-css/dist/js/materialize";
import { AWSClientService } from '../../services/awsclient.service';
import { Template } from '../../template';
import { User } from '../../models/User';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  projectName: string;
  projectOwner: string;
  projectDescription: string;
  owners: User[];
  selectedIndex: number = null;
  dynamoTables: string[] = [];

  constructor(private client: AWSClientService) { }

  // TODO: unsubscribe observable (ngdestroy)
  ngOnInit() {
    this.client.getUsers().subscribe((data: User[]) => {
      this.owners = data;
      if (data.length > 0) {
        this.selectedIndex = 0;
        this.projectOwner = this.owners[0].email;
      }
    });
  }

  ngAfterViewInit() {
    M.Collapsible.init(document.querySelectorAll('.collapsible'), {});
  }

  onSubmit() {
    console.log('Submitted request')
    let template: Template = new Template(this.projectDescription);
    console.log('Response: ', this.client.createProject(
      this.projectName,
      this.projectOwner,
      this.projectDescription,
      template,
      this.dynamoTables
    ).toPromise());
  }

  setIndex(index: number, owner: string) {
    this.projectOwner = owner;
    this.selectedIndex = index;
  }
}
