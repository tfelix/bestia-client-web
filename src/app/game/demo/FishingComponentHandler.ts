import * as LOG from 'loglevel';

import { ClientMessageHandler } from './ClientMessageHandler';
import { UpdateComponentMessage } from 'app/game/message';
import { FishingComponent, ComponentType } from 'app/game/entities/components';
import { ServerEntityStore } from './ServerEntityStore';

export class FishingComponentHandler extends ClientMessageHandler<UpdateComponentMessage<FishingComponent>> {
  constructor(
    serverEntities: ServerEntityStore
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

    } else {

    }

    this.deleteComponent(msg.component);
  }

  private hasSuccessfullFished(component: FishingComponent): boolean {
    return true;
  }
}
