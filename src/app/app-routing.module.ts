import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { CreateComponent } from './create/create.component';
import { DetailComponent } from './detail/detail.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './_helpers/auth.guard';
import { RegisterComponent } from './register/register.component';
import { CreateUserComponent } from './create-user/create-user.component';


const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard]}, //, canActivate: [AuthGuard]
  { path: 'login', component: LoginComponent},
  { path: 'browse/:id', component: DetailComponent},
  { path: 'create', component: CreateComponent},
  { path: 'register', component: RegisterComponent},
  { path: 'create-user', component: CreateUserComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [
  HomeComponent,
  LoginComponent,
  CreateComponent,
  DetailComponent,
  RegisterComponent
]
