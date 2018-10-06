import { Item } from 'app/game/model';

import { Component } from './Component';
import { ComponentType } from './ComponentType';

export class InventoryComponent extends Component {

  public readonly items: Item[] = [];

  constructor(id: number, entityId: number) {
    super(id, entityId, ComponentType.INVENTORY);
  }
}
