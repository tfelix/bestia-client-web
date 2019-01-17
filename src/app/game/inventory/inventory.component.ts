import { Component, OnInit } from '@angular/core';
import { state, style, transition, animate, trigger } from '@angular/animations';

export class ItemModel {
  constructor(
    readonly playerItemId: number,
    readonly image: string,
    readonly amount: number,
    readonly name: string,
    readonly weight: number
  ) {
  }

  public get totalWeight(): number {
    return this.weight * this.amount;
  }

  public get imageUrl(): string {
    return `/assets/sprites/items/${this.image}`;
  }
}

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
  public items: ItemModel[] = [];

  constructor() { }

  ngOnInit() {
    this.items = [
      new ItemModel(
        1,
        'empty_bottle.png',
        10,
        'Empty Bottle',
        0.1,
      )
    ];
  }

  close() {
    this.isOpen = false;
  }

  open() {
    this.isOpen = true;
  }
}
