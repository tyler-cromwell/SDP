import { Component } from '@angular/core';
import { AWSClientService } from '../awsclient.service';
import * as M from "materialize-css/dist/js/materialize";
import { Router } from '@angular/router';
import { AuthenticationService } from './_services/Authentication.service';
import { User } from './_helpers/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AWSClientService]
})
export class AppComponent {
  title: string = 'SDP';
  instances = [];
  currentUser: User;

  constructor(private client: AWSClientService, private router: Router,
    private authenticationService: AuthenticationService) {
    document.addEventListener('DOMContentLoaded', function() {
      var elems = document.querySelectorAll('.dropdown-trigger');
      var options = {};
      var instances = M.Dropdown.init(elems, options);
    });

    // CurrentUser Login Data
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  
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

  // Logout current user
  logout() {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
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
