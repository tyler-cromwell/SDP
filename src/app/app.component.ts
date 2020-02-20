import { Component } from '@angular/core';
import { AWSClientService } from '../awsclient.service';
import * as M from "materialize-css/dist/js/materialize";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AWSClientService]
})
export class AppComponent {
  title = 'SDP';
  instances = [];

  constructor(private client: AWSClientService) {
    document.addEventListener('DOMContentLoaded', function() {
      var elems = document.querySelectorAll('.dropdown-trigger');
      var options = {};
      var instances = M.Dropdown.init(elems, options);
    });

    this.client.getInstances().subscribe(data => {
        let reservations = JSON.parse(data)["Reservations"]

        if (reservations.length) {
          this.instances = reservations.map(res => {
              return res["Instances"][0]
            }
          )
        } else {
          this.instances = []
        }
      }
    )
  }

  ngOnInit() { }

  handleGetInstances(event: Event) {
    this.client.getInstances().subscribe(data => {
        let reservations = JSON.parse(data)["Reservations"]

        if (reservations.length) {
          this.instances = reservations.map(res => {
              return res["Instances"][0]
            }
          )
        } else {
          this.instances = []
        }
      }
    )
  }

  handleCreateInstance(event: Event) {
    /*
    this.client.createInstance(
      "t2.micro",
      "ami-04b9e92b5572fa0d1"
    ).subscribe(data => {
        console.log(JSON.parse(data))
      }
    )
    */
  }
}
