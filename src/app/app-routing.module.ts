import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { CreateComponent } from './create/create.component';
import { DetailComponent } from './detail/detail.component';
import { CreateUserComponent } from './create-user/create-user.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'browse/:id', component: DetailComponent},
  { path: 'create', component: CreateComponent},
  { path: 'create-user', component: CreateUserComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [
  HomeComponent,
  CreateComponent,
  DetailComponent
]
