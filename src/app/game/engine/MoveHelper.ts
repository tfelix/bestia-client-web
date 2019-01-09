import * as LOG from 'loglevel';

import { Point, Px } from 'app/game/model';
import { MoveComponent, ComponentType, PositionComponent } from 'app/game/entities';
import { sendToServer, UpdateComponentMessage } from 'app/game/message';

import { MapHelper } from './MapHelper';
import { EngineContext } from './EngineContext';

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

    const componentId = Math.floor(Math.random() * -100000);
    const playerEntity = this.ctx.playerHolder.activeEntity;
    // We must remove the possibly currently present component so we can start new.
    playerEntity.removeComponentByType(ComponentType.MOVE);

    const moveComponent = new MoveComponent(
      componentId,
      playerEntity.id
    );
    moveComponent.walkspeed = 1;
    moveComponent.path = shiftedPath;
    if (callbackFn) {
      moveComponent.onMoveFinished.push(callbackFn);
    }

    playerEntity.addComponent(moveComponent);
    const updateMsg = new UpdateComponentMessage(moveComponent);
    sendToServer(updateMsg);
  }

  public moveToPoint(goal: Point, callbackFn?: () => void) {
    const activePlayerEntity = this.ctx.playerHolder.activeEntity;
    if (!activePlayerEntity) {
      return;
    }
    const playerPositionComponent = activePlayerEntity.getComponent(ComponentType.POSITION) as PositionComponent;
    if (!playerPositionComponent) {
      return;
    }
    const start = playerPositionComponent.position;

    const scrollOffset = this.ctx.helper.display.getScrollOffset();
    const shiftedStart = start.minus(scrollOffset);
    const shiftedGoal = goal.minus(scrollOffset);

    LOG.debug(`Find path from: ${JSON.stringify(start)} to ${JSON.stringify(goal)}`);
    this.ctx.pathfinder.findPath(
      shiftedStart.x,
      shiftedStart.y,
      shiftedGoal.x,
      shiftedGoal.y,
      (path) => this.onPathFound(scrollOffset, path, callbackFn)
    );
  }

  public moveToPixel(pointer: Px, callbackFn?: () => void) {
    const goal = MapHelper.pixelToPoint(pointer.x, pointer.y);
    this.moveToPoint(goal, callbackFn);
  }
}
