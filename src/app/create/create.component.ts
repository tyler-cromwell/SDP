import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

import * as M from "materialize-css/dist/js/materialize";
import { AWSClientService } from '../../awsclient.service';
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
  owners: string[];
  // @ViewChild('ownerSelect', {static:true}) ownerSelect: ElementRef;

  constructor(private client: AWSClientService) {  
    this.owners = [];
  }

  ngOnInit() {
    // M.FormSelect.init(this.ownerSelect.nativeElement, {});      
    this.client.getUsers().subscribe((data: User[]) => {
      for (let user of data) {
        console.log("email: " + user.email);
        this.owners.push(user.email);
      }    
    });
  }
  
  ngAfterViewInit() {    
  }

  onSubmit() {
    let template: Template = new Template();
    template.json['Description'] = this.projectDescription;
    this.client.createProject(
      this.projectName,
      this.projectOwner,
      this.projectDescription,
      template
    ).subscribe(
      data => {
        console.log(data)
      }
    );
  }
}
