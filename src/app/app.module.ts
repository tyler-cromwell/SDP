import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { fakeBackendProvider } from './_helpers/fake-backend';
import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { Ec2Component } from './ec2/ec2.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { AWSClientService, NotificationService, LoggingService } from 'src/services/services';

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
    ReactiveFormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },

    // provider used to create fake backend
    fakeBackendProvider,
    AWSClientService,
    NotificationService,
    LoggingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
