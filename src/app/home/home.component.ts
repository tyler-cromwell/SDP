import { Component, OnInit } from '@angular/core';

import { AWSClientService } from '../../awsclient.service';
import { Template } from '../../template';
import * as M from "materialize-css/dist/js/materialize";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [AWSClientService]
})
export class HomeComponent implements OnInit {
  private projects = [];

  constructor(private client: AWSClientService) {
    document.addEventListener('DOMContentLoaded', function() {
      var elems = document.querySelectorAll('.modal');
      var instances = M.Modal.init(elems);
    });

    this.client.getProjects().subscribe(data => {
        let items = JSON.parse(data)["Items"]

        if (items.length) {
          this.projects = items
        }
      }
    )
  }

  ngOnInit() { }
}
