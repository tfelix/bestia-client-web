import { ComponentUpdaterHandler } from './ComponentUpdateHandler';
import { ComponentDeleteMessage } from '../message/ComponentDeleteMessage';
import { ComponentMessage } from '../message/ComponentMessage';
import { PlayerEntityHolder, Component, InventoryComponent, ComponentType } from '../entities';
import { EngineEvents } from '../message';
import { ItemModel, InventoryModel } from '../inventory/inventory.component';

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
      i.image,
      i.amount,
      i.name,
      i.weight
    ));

    const inventoryModel = new InventoryModel(
      inventoryComp.maxItems,
      inventoryComp.maxWeight,
      itemModels
    );

    PubSub.publish(EngineEvents.INVENTORY_UPDATE, inventoryModel);
  }

  updatesOnComponentType(): ComponentType[] {
    return [ComponentType.INVENTORY];
  }

  onComponentDeleteMessage(msg: ComponentDeleteMessage) {
    // no op.
  }
}
