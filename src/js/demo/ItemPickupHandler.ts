import { ItemPickupMessage } from 'message';
import { EntityStore } from 'entities';
import { ClientMessageHandler } from './ClientMessageHandler';

export class ItemPickupHandler extends ClientMessageHandler<ItemPickupMessage> {

  constructor(
    private readonly serverEntities: EntityStore
  ) {
    super();

  }

  public isHandlingMessage(msg: any): boolean {
    return msg instanceof ItemPickupMessage;
  }

  public handle(msg: ItemPickupMessage) {
    const itemEntity = this.serverEntities.getEntity(msg.itemEntityId);
    // TODO Handle the item pickup
    this.deleteEntity(itemEntity);
  }
}
