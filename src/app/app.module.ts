import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { Ec2Component } from './ec2/ec2.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { AWSClientService } from 'src/services/awsclient.service';
import { NotificationService } from 'src/services/notification.service';

@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    Ec2Component,
    CreateUserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [
    AWSClientService,
    NotificationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
