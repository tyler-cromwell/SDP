import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AWSClientService } from '../../awsclient.service';
import * as M from "materialize-css/dist/js/materialize";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [AWSClientService]
})
export class HomeComponent implements OnInit {
  private projects: any = []
  private currentSearch: object
  // private projects: any = [
  //   {
  //     id: "sdf231as",
  //     name: "FooBar",
  //     description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  //     version: "1.0.0"
  //   },
  //   {
  //     id: "fasf23ds2",
  //     name: "BarFooBar",
  //     description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
  //     version: "1.4.2"
  //   }
  // ];

  constructor(private client: AWSClientService, private router: Router) { }

  ngOnInit() {
    this.client.getProjects().subscribe(data => {
      this.projects = data
    });
  }

  onSearch(form: NgForm) {
    this.client.getProject(form.value.projectName).subscribe(data => {
      this.currentSearch = data[0]
      if (this.currentSearch) {
        this.router.navigate(['browse/' + form.value.projectName]);
      } else {
        alert('No project with such name found');
      }
    })
  }

  toggleModal() {
    var elems = document.querySelectorAll('.modal');
    M.Modal.init(elems);
  }
}
