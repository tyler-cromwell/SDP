import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  projectName: string;
  projectOwner: string;
  projectDescription: string;

  constructor() { }

  ngOnInit() { }

  onSubmit() {
    console.log(this.projectName)
    console.log(this.projectOwner)
    console.log(this.projectDescription)
  }
}
