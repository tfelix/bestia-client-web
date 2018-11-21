import * as LOG from 'loglevel';

import { ClientMessageHandler } from './ClientMessageHandler';
import { UpdateComponentMessage } from 'app/game/message';
import { FishingComponent, ComponentType, InventoryComponent } from 'app/game/entities/components';
import { ServerEntityStore } from './ServerEntityStore';
import { Item } from '../model';

export class FishingComponentHandler extends ClientMessageHandler<UpdateComponentMessage<FishingComponent>> {
  constructor(
    serverEntities: ServerEntityStore,
    private readonly playerEntityId: number
  ) {
    super(serverEntities);
  }

  public isHandlingMessage(msg: any): boolean {
    if (msg instanceof UpdateComponentMessage) {
      return msg.component instanceof FishingComponent;
    } else {
      return false;
    }
  }
  public handle(msg: UpdateComponentMessage<FishingComponent>) {
    if (this.hasSuccessfullFished(msg.component)) {
      const playerEntity = this.serverEntities.getEntity(this.playerEntityId);
      const playerInventoryComp = playerEntity.getComponent(ComponentType.INVENTORY) as InventoryComponent;
      const fishItem = new Item(10, 11, 'fish', 1);
      playerInventoryComp.items.push(fishItem);
      playerEntity.addComponent(playerInventoryComp);
      this.sendComponent(playerInventoryComp);
    } else {

    }

    this.deleteComponent(msg.component);
  }

  private hasSuccessfullFished(component: FishingComponent): boolean {
    return true;
  }
}
