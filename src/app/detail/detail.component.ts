import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as M from "materialize-css/dist/js/materialize";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {
  @ViewChild('modalEC2Input', {static: true}) modalEC2Input: ElementRef;

  constructor() { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    M.Modal.init(this.modalEC2Input.nativeElement, {});
  }
}
