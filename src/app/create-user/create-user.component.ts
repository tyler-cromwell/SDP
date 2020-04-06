import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AWSClientService } from 'src/awsclient.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {

  constructor(private client: AWSClientService) { }

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    this.client.postUser(form.value).subscribe();
  }
}
