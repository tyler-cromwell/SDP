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
  instances = [];

  constructor(private client: AWSClientService) { }

  ngOnInit() { }

  ngAfterViewInit() {
    var elems = document.querySelectorAll('.dropdown-trigger');
    var options = {
      "coverTrigger": false
    };
    M.Dropdown.init(elems, options); 
  }
}
