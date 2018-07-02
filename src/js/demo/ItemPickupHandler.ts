import { RequestItemLootMessage } from 'message';
import { EntityStore } from 'entities';
import { ClientMessageHandler } from './ClientMessageHandler';
import { ComponentType } from 'entities/components';
import { InventoryComponent } from 'entities/components/InventoryComponent';

export class ItemPickupHandler extends ClientMessageHandler<RequestItemLootMessage> {

  constructor(
    private readonly serverEntities: EntityStore,
    private readonly playerEntityId: number
  ) {
    super();

  }

  public isHandlingMessage(msg: any): boolean {
    return msg instanceof RequestItemLootMessage;
  }

  public handle(msg: RequestItemLootMessage) {
    const itemEntity = this.serverEntities.getEntity(msg.itemEntityId);

    if (!itemEntity) {
      return;
    }

    // Maybe using an inventory component is not the best choice here since the client displays
    // only one item anyways. On a second thought I like it because we can then handle it in the ui
    // if we show some kind of loot windows where the player can manipulate the looting process. If there
    //  is only one item in the inventory, just grab it.
    const itemContent = itemEntity.getComponent(ComponentType.INVENTORY) as InventoryComponent;
    const lootedItem = itemContent.items[0];
    const playerEntity = this.serverEntities.getEntity(this.playerEntityId);
    const playerInventoryComp = playerEntity.getComponent(ComponentType.INVENTORY) as InventoryComponent;
    playerInventoryComp.items.push(lootedItem);
    playerEntity.addComponent(playerInventoryComp);
    this.sendClient(playerInventoryComp);

    this.deleteEntity(itemEntity);
  }
}
