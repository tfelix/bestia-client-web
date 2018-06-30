import { ItemPickupMessage } from 'message';
import { EntityStore } from 'entities';

interface ClientMessageHandler<T> {
  isHandlingMessage(msg: any): boolean;
  handle(msg: T);
}

export class ItemPickupHandler implements ClientMessageHandler<ItemPickupMessage> {

  constructor(
    private readonly serverEntities: EntityStore
  ) {

  }

  public isHandlingMessage(msg: any): boolean {
    return msg instanceof ItemPickupMessage;
  }

  public handle(msg: ItemPickupMessage) {
    
  }
}
