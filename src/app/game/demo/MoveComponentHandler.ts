import * as LOG from 'loglevel';

import { ClientMessageHandler } from './ClientMessageHandler';
import { UpdateComponentMessage, ComponentMessage } from 'app/game/message';
import { Entity } from 'app/game/entities';
import { MoveComponent, ComponentType, PositionComponent } from 'app/game/entities/components';
import { ServerEntityStore } from './ServerEntityStore';
import { MapHelper } from '../engine';

/**
 * The move handler must handle bi-directional messages coming into the server and getting out of the
 * server as we must keep track over ongoing movements.
 */
export class MoveComponentHandler extends ClientMessageHandler<UpdateComponentMessage<MoveComponent>> {

  private entitiesMovementCallbacks = new Map<number, { callback: number, componentId: number }>();

  constructor(
    serverEntities: ServerEntityStore
  ) {
    super(serverEntities);
  }

  public isHandlingMessage(msg: any): boolean {
    if (msg instanceof UpdateComponentMessage) {
      return msg.component instanceof MoveComponent;
    }

    // We must also handle messages send from the server to the client.
    if (msg instanceof ComponentMessage) {
      return msg.component instanceof MoveComponent;
    }

    return false;
  }

  public handle(msg: UpdateComponentMessage<MoveComponent> | ComponentMessage<MoveComponent>) {
    const entity = this.serverEntities.getEntity(msg.component.entityId);

    if (entity == null) {
      return;
    }

    if (this.isComponentAlreadyTracked(msg.component)) {
      return;
    }

    const existingMovementCallback = this.entitiesMovementCallbacks.get(entity.id);
    if (existingMovementCallback) {
      window.clearTimeout(existingMovementCallback.callback);
    }

    const moveCopy = new MoveComponent(
      msg.component.id,
      msg.component.entityId
    );
    moveCopy.path = msg.component.path.slice();
    moveCopy.walkspeed = msg.component.walkspeed;
    entity.addComponent(moveCopy);

    const posComp = entity.getComponent(ComponentType.POSITION) as PositionComponent;
    if (!posComp) {
      return;
    }
    const currentPosPx = MapHelper.pointToPixel(posComp.position);
    const targetPosPx = MapHelper.pointToPixel(moveCopy.path[0]);
    const moveDuration = MapHelper.getWalkDuration(currentPosPx, targetPosPx, moveCopy.walkspeed);

    const callbackId = window.setTimeout(() => {
      this.moveTick(entity, moveCopy);
    }, moveDuration);
    this.entitiesMovementCallbacks.set(entity.id, { callback: callbackId, componentId: moveCopy.id });
  }

  /**
   * Check if this handler already tracks this component and avoid recursive calls because
   * the updated MoveComponent is also send to the client after each tick which we dont want to
   * track anymore.
   */
  private isComponentAlreadyTracked(move: MoveComponent): boolean {
    const callback = this.entitiesMovementCallbacks.get(move.entityId);

    return callback && callback.componentId === move.id;
  }

  private moveTick(entity: Entity, move: MoveComponent) {
    const currentPosition = move.path.shift();
    LOG.debug(`Updating entity ${entity.id} position: ${JSON.stringify(currentPosition)}`);

    const posComp = entity.getComponent(ComponentType.POSITION) as PositionComponent;
    if (!posComp) {
      return;
    }
    posComp.position = currentPosition;

    this.sendComponent(posComp);
    this.sendComponent(move);

    if (move.path.length > 0) {
      const currentPosPx = MapHelper.pointToPixel(posComp.position);
      const targetPosPx = MapHelper.pointToPixel(move.path[0]);
      const moveDuration = MapHelper.getWalkDuration(currentPosPx, targetPosPx, move.walkspeed);

      const callbackId = window.setTimeout(() => {
        this.moveTick(entity, move);
      }, moveDuration);
      this.entitiesMovementCallbacks.set(entity.id, { callback: callbackId, componentId: move.id });
    } else {
      entity.removeComponentByType(ComponentType.MOVE);
    }
  }
}
