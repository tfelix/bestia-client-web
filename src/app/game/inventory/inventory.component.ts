import { Component, OnInit } from '@angular/core';
import { state, style, transition, animate, trigger } from '@angular/animations';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  animations: [
    trigger('openClose', [
      state('open', style({
        opacity: 1,
        bottom: 0
      })),
      state('closed', style({
        opacity: 0,
        bottom: '-200px'
      })),
      transition('open => closed', [
        animate('0.3s')
      ]),
      transition('closed => open', [
        animate('0.3s')
      ]),
    ])
  ]
})
export class InventoryComponent implements OnInit {

  public isOpen = false;

  constructor() { }

  ngOnInit() {
  }

  close() {
    this.isOpen = false
  }

  open() {
    this.isOpen = true;
  }
}