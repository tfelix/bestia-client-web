import { Component, OnInit } from '@angular/core';
import { state, style, transition, animate, trigger } from '@angular/animations';
import { EngineEvents } from '../message';

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

export class InventoryModel {
  constructor(
    readonly maxItemCount: number,
    readonly maxWeight: number,
    readonly items: ItemModel[]
  ) { }
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  animations: [
    trigger('openClose', [
      state('open', style({
        opacity: 1,
      })),
      state('closed', style({
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

  public isOpen = true;
  public items: ItemModel[] = [];

  public get itemCount(): number {
    return this.items.length;
  }

  public itemMaxCount = 1000;

  public get weight(): number {
    return this.items
      .map(x => x.totalWeight)
      .reduce((a, b) => a + b, 0);
  }

  public maxWeight = 0;

  constructor() { }

  ngOnInit() {
    PubSub.subscribe(EngineEvents.INVENTORY_UPDATE, this.updateModel.bind(this));
    /*this.items = [
      new ItemModel(
        1,
        'empty_bottle.png',
        10,
        'Empty Bottle',
        0.1,
      ),
      new ItemModel(
        1,
        'empty_bottle.png',
        14,
        'Empty Bottle',
        0.1,
      )
    ];*/
  }

  private updateModel(_, model: InventoryModel) {
    this.maxWeight = model.maxWeight;
    this.itemMaxCount = model.maxItemCount;
    this.items = model.items;
  }

  close() {
    this.isOpen = false;
  }

  open() {
    this.isOpen = true;
  }
}
