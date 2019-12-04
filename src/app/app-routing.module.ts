import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { BrowseComponent } from './browse/browse.component';
import { CreateComponent } from './create/create.component';
import { DetailComponent } from './detail/detail.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'browse', component: BrowseComponent},
  { path: 'browse/:id', component: DetailComponent},
  { path: 'create', component: CreateComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [
  HomeComponent,
  BrowseComponent,
  CreateComponent,
  DetailComponent
]
