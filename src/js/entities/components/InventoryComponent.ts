import { Component } from './Component';
import { Item } from 'model';
import { ComponentType } from './ComponentType';

export class InventoryComponent extends Component {

  public readonly items: Item[] = [];

  constructor(id: number, entityId: number) {
    super(id, entityId, ComponentType.INVENTORY);
  }
}
