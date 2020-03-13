import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import * as M from "materialize-css/dist/js/materialize";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {    
  private projectName: string;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() { 
    this.activatedRoute.params.subscribe(params => {
      this.projectName = params['id'];      
    });
  }

  ngAfterViewInit() {    
    let elems = document.querySelectorAll('.collapsible');    
    M.Collapsible.init(elems, {});
  }
}
