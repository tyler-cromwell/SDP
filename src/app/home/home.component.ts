import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { AWSClientService } from '../../services/awsclient.service';
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
