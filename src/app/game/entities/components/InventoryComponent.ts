import { Component } from './Component';
import { ComponentType } from './ComponentType';

export class Item {

  constructor(
    public readonly itemId: number,
    public readonly playerItemId: number,
    public readonly name: string,
    public amount: number,
  ) {
  }
}

export class InventoryComponent extends Component {

  public readonly items: Item[] = [];

  constructor(id: number, entityId: number) {
    super(id, entityId, ComponentType.INVENTORY);
  }
}
