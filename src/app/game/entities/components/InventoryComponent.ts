import { Component } from './Component';
import { ComponentType } from './ComponentType';

export class Item {

  constructor(
    public readonly itemId: number,
    public readonly playerItemId: number,
    public readonly dbName: string,
    public readonly image: string,
    public readonly weight: number,
    public amount: number,
  ) {
  }
}

export class InventoryComponent extends Component {

  public readonly items: Item[] = [];
  public maxWeight: number;
  public maxItems: number;

  constructor(id: number, entityId: number) {
    super(id, entityId, ComponentType.INVENTORY);
  }

  get totalItemCount(): number {
    return this.items.map(x => x.amount).reduce((a, b) => a + b, 0);
  }
}
