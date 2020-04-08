import { Component } from '@angular/core';
import { AWSClientService } from '../services/awsclient.service';
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
  instances = [];
  currentUser: User;

  constructor(private client: AWSClientService, private router: Router,
    private authenticationService: AuthenticationService) {
    document.addEventListener('DOMContentLoaded', function() {
      var elems = document.querySelectorAll('.dropdown-trigger');
      var options = {
        "coverTrigger": false
      };
      var instances = M.Dropdown.init(elems, options);
    });

    // CurrentUser Login Data
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  // Logout current user
  logout() {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
  }

  ngOnInit() { }

  ngAfterViewInit() {
    var elems = document.querySelectorAll('.dropdown-trigger');
    var options = {
      "coverTrigger": false
    };
    M.Dropdown.init(elems, options); 
  }
}
