import { Component, OnInit } from '@angular/core';

import { AWSClientService } from '../../awsclient.service';


@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  projectName: string;
  projectOwner: string;
  projectDescription: string;

  constructor(private client: AWSClientService) { }

  ngOnInit() { }

  onSubmit() {
    this.client.postProject(
      this.projectName,
      this.projectOwner,
      this.projectDescription
    ).subscribe(
      data => {
        console.log(JSON.parse(data))
      }
    )
  }
}
