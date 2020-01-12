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

  constructor(private client: AWSClientService) {
    document.addEventListener('DOMContentLoaded', function() {
      var elems = document.querySelectorAll('.dropdown-trigger');
      var options = {};
      var instances = M.Dropdown.init(elems, options);
    });
  }

  ngOnInit() { }

  handleGetInstances(event: Event) {
    console.log('Retrieving EC2 instances...')
    this.client.getInstances().subscribe(data => console.log(
        JSON.stringify(JSON.parse(data), null, 2)
      )
    )
  }

  handlePostInstances(event: Event) {
    console.log('Creating EC2...')
    /*
    this.client.postInstances().subscribe(data => console.log(
        JSON.stringify(JSON.parse(data), null, 2)
      )
    )
    */
  }
}
