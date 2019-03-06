import { AbortPerformMessage, ComponentMessage, ComponentDeleteMessage } from 'app/game/message';
import { ComponentType, PerformComponent } from 'app/game/entities/components';

import { ClientMessageHandler } from './ClientMessageHandler';
import { ServerEntityStore } from '../ServerEntityStore';

export class AbortPerformHandler extends ClientMessageHandler<AbortPerformMessage> {

  constructor(
    serverEntities: ServerEntityStore,
    private readonly playerEntityId: number
  ) {
    super(serverEntities);
  }

  public isHandlingMessage(msg: any): boolean {
    return msg instanceof AbortPerformMessage;
  }

  public handle(msg: AbortPerformMessage) {
    const playerEntity = this.serverEntities.getEntity(this.playerEntityId);

    const performComp = playerEntity.getComponent(ComponentType.PERFORM) as PerformComponent;
    if (performComp == null || !performComp.canAbort) {
      return;
    }

    playerEntity.removeComponentByType(ComponentType.PERFORM);

    const deleteMessage = new ComponentDeleteMessage(1, ComponentType.PERFORM);
    this.sendClient(deleteMessage);
  }
}