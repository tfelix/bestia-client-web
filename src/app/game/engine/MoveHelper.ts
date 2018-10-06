import * as LOG from 'loglevel';

import { Point, Px } from 'app/game/model';
import { MapHelper } from 'app/game/map';
import { MoveComponent, ComponentType, PositionComponent } from 'app/game/entities';

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

    const componentId = Math.floor(Math.random() * -10000);
    const playerEntity = this.ctx.playerHolder.activeEntity;
    // We must remove the possibly currently present component so we can start new.
    playerEntity.removeComponentByType(ComponentType.MOVE);

    const move = new MoveComponent(
      componentId,
      playerEntity.id
    );
    move.walkspeed = 1;
    move.path = shiftedPath;
    if (callbackFn) {
      move.onMoveFinished.push(callbackFn);
    }
    playerEntity.addComponent(move);
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

    LOG.debug(`Find path from: ${JSON.stringify(shiftedStart)} to ${JSON.stringify(shiftedGoal)}`);
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
