import { ClientMessageHandler } from './ClientMessageHandler';
import { UpdateComponentMessage } from 'app/game/message';
import { Entity } from 'app/game/entities';
import { MoveComponent, ComponentType } from 'app/game/entities/components';
import { ServerEntityStore } from './ServerEntityStore';

export class MoveComponentHandler extends ClientMessageHandler<UpdateComponentMessage<MoveComponent>> {
  constructor(
    private readonly serverEntities: ServerEntityStore
  ) {
    super();
  }

  public isHandlingMessage(msg: any): boolean {
    if (msg instanceof UpdateComponentMessage) {
      return msg.component instanceof MoveComponent;
    } else {
      return false;
    }
  }
  public handle(msg: UpdateComponentMessage<MoveComponent>) {
    const entity = this.serverEntities.getEntity(msg.component.entityId);

    if (entity == null) {
      return;
    }

    const moveCopy = new MoveComponent(
      msg.component.id,
      msg.component.entityId
    );
    moveCopy.path = msg.component.path.slice();
    moveCopy.walkspeed = msg.component.walkspeed;
    entity.addComponent(moveCopy);

    window.setTimeout(() => {
      this.moveTick(entity, moveCopy);
    }, 300);
  }

  private moveTick(entity: Entity, move: MoveComponent) {
    move.path.shift();

    if (move.path.length > 0) {
      window.setTimeout(() => {
        this.moveTick(entity, move);
      }, 300);
    } else {
      entity.removeComponentByType(ComponentType.MOVE);
    }
  }
}
