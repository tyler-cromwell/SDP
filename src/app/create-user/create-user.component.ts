import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AWSClientService } from 'src/services/awsclient.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {
  private isCreatingUser: Boolean = false;

  constructor(private client: AWSClientService) { }

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    this.isCreatingUser = true;
    this.client.postUser(form.value).subscribe(() => {
      this.isCreatingUser = false;
    });
  }
}
