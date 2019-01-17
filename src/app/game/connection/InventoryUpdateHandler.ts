import { ComponentUpdaterHandler } from './ComponentUpdateHandler';
import { ComponentDeleteMessage } from '../message/ComponentDeleteMessage';
import { ComponentMessage } from '../message/ComponentMessage';
import { PlayerEntityHolder, Component, InventoryComponent, ComponentType } from '../entities';
import { EngineEvents } from '../message';
import { ItemModel } from '../inventory/inventory.component';

/**
 * This handler will transform the messages into the Item model and then send them
 * out.
 */
export class InventoryUpdateHandler implements ComponentUpdaterHandler {

  constructor(
    private readonly playerHolder: PlayerEntityHolder
  ) {
    // no op
  }

  public onComponentMessage(msg: ComponentMessage<Component>) {
    if (this.playerHolder.activeEntity.id !== msg.component.entityId) {
      return;
    }

    const inventoryComp = msg.component as InventoryComponent;
    const itemModels = inventoryComp.items.map(i => new ItemModel(
      i.playerItemId,
      'img',
      i.amount,
      i.name,
      0
    ));
    PubSub.publish(EngineEvents.INVENTORY_UPDATE, itemModels);
  }

  updatesOnComponentType(): ComponentType[] {
    return [ComponentType.INVENTORY];
  }

  onComponentDeleteMessage(msg: ComponentDeleteMessage) {
    // no op.
  }
}
