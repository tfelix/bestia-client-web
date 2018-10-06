import { ClientMessageHandler } from './ClientMessageHandler';
import { AbortPerformMessage, ComponentMessage, ComponentDeleteMessage } from 'message';
import { ComponentType, PerformComponent } from 'entities/components';
import { ServerEntityStore } from './ServerEntityStore';

export class AbortPerformHandler extends ClientMessageHandler<AbortPerformMessage> {

  constructor(
    private readonly serverEntities: ServerEntityStore,
    private readonly playerEntityId: number
  ) {
    super();
  }

  public isHandlingMessage(msg: any): boolean {
    return msg instanceof AbortPerformMessage;
  }

  public handle(msg: AbortPerformMessage) {
    const perfComp = new PerformComponent(
      71235,
      this.playerEntityId
    );
    perfComp.duration = 10000;
    perfComp.skillname = 'chop_tree';
    const playerEntity = this.serverEntities.getEntity(this.playerEntityId);
    playerEntity.addComponent(perfComp);
    const compMsg = new ComponentMessage<PerformComponent>(perfComp);
    this.sendClient(compMsg);

    window.setTimeout(() => {
      const deleteMessage = new ComponentDeleteMessage(1, ComponentType.PERFORM);
      this.sendClient(deleteMessage);
    },
      10000
    );

    const deleteMessage = new ComponentDeleteMessage(this.playerEntityId, ComponentType.PERFORM);
    this.sendClient(deleteMessage);
  }

}
