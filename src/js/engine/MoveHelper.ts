import * as LOG from 'loglevel';

import { Point, Px } from 'model';
import { EngineContext } from './EngineContext';
import { MoveComponent, ComponentType, PositionComponent } from 'entities/components';
import { MapHelper } from 'map';

export class MoveHelper {

  constructor(
    private readonly ctx: EngineContext
  ) {
  }

  private onPathFound(usedShiftOffset: Point, path: Array<{ x: number; y: number }>, callbackFn?: () => void) {
    if (path === null) {
      return;
    }
    // We must shift the path into the collision map first. Now we must undo this again to
    // world space.
    const shiftedPath = path.map(pos => new Point(pos.x + usedShiftOffset.x, pos.y + usedShiftOffset.y));

    LOG.debug(`Path found: ${JSON.stringify(shiftedPath)}`);
    if (shiftedPath.length === 0) {
      return;
    }

    const componentId = Math.floor(Math.random() * -10000);

    const playerEntityId = this.ctx.playerHolder.activeEntity.id;
    const move = new MoveComponent(
      componentId,
      playerEntityId
    );
    move.walkspeed = 1;
    move.path = shiftedPath;
    this.ctx.entityStore.addComponent(move);

    if (callbackFn) {
      callbackFn();
    }
  }

  public moveTo(pointer: Px, callbackFn?: () => void) {
    const activePlayerEntity = this.ctx.playerHolder.activeEntity;
    if (!activePlayerEntity) {
      return;
    }
    const playerPositionComponent = activePlayerEntity.getComponent(ComponentType.POSITION) as PositionComponent;
    if (!playerPositionComponent) {
      return;
    }
    const start = playerPositionComponent.position;
    const goal = MapHelper.pixelToPoint(pointer.x, pointer.y);

    const scrollOffset = this.ctx.helper.display.getScrollOffset();
    const shiftedStart = start.minus(scrollOffset);
    const shiftedGoal = goal.minus(scrollOffset);

    LOG.debug(`Find path from: ${JSON.stringify(shiftedStart)} to ${JSON.stringify(shiftedGoal)}`);
    this.ctx.pathfinder.findPath(
      shiftedStart.x,
      shiftedStart.y,
      shiftedGoal.x,
      shiftedGoal.y,
      (path) => this.onPathFound(scrollOffset, path, callbackFn)
    );
  }
}
