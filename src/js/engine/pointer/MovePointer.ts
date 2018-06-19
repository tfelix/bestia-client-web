import * as LOG from 'loglevel';

import { Point, Px } from 'model';
import { ComponentType, PositionComponent, MoveComponent } from 'entities/components';
import { MapHelper } from 'map/MapHelper';

import { Pointer } from './Pointer';
import { PointerManager } from './PointerManager';
import { EngineContext } from '../EngineContext';
import { DisplayHelper } from '../DisplayHelper';
import { Entity } from 'entities';
import { PointerPriority } from './PointerPriority';

export class MovePointer extends Pointer {

  private marker: Phaser.GameObjects.Sprite;
  private displayHelper: DisplayHelper;

  constructor(
    manager: PointerManager,
    ctx: EngineContext
  ) {
    super(manager, ctx);

    this.displayHelper = new DisplayHelper(ctx.game);
  }

  public checkActive(pointer: Px, entity?: Entity): number {
    return PointerPriority.MOVE;
  }

  public activate() {
    this.marker.visible = true;
    this.ctx.game.input.on('pointerdown', this.onClickMove, this);
  }

  public updatePosition(px: Px) {
    this.marker.setPosition(px.x, px.y);

    const offset = this.displayHelper.getScrollOffset();
    const point = MapHelper.pixelToPoint(px.x, px.y).minus(offset);
    this.marker.visible = !this.isNotWalkable(point);
  }

  private isNotWalkable(point: Point) {
    return this.ctx.collisionUpdater.hasCollision(point.x, point.y);
  }

  private onPathFound(usedShiftOffset: Point, path: Array<{ x: number; y: number }>) {
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
  }

  private onClickMove(pointer: Phaser.Input.Pointer) {
    if (!pointer.leftButtonDown) {
      return;
    }

    const activePlayerEntity = this.ctx.playerHolder.activeEntity;
    if (!activePlayerEntity) {
      return;
    }
    const playerPositionComponent = activePlayerEntity.getComponent(ComponentType.POSITION) as PositionComponent;
    if (!playerPositionComponent) {
      return;
    }
    const pxScrollOffset = this.displayHelper.getScrollOffsetPx();
    const start = playerPositionComponent.position;
    const goal = MapHelper.pixelToPoint(pointer.downX + pxScrollOffset.x, pointer.downY + pxScrollOffset.y);

    const scrollOffset = this.displayHelper.getScrollOffset();
    const shiftedStart = start.minus(scrollOffset);
    const shiftedGoal = goal.minus(scrollOffset);

    if (this.isNotWalkable(shiftedGoal)) {
      return;
    }

    LOG.debug(`Find path from: ${JSON.stringify(shiftedStart)} to ${JSON.stringify(shiftedGoal)}`);
    this.ctx.pathfinder.findPath(shiftedStart.x, shiftedStart.y, shiftedGoal.x, shiftedGoal.y, this.onPathFound.bind(this, scrollOffset));
  }

  public load(loader) {
    this.ctx.game.load.spritesheet(
      'indicator_move',
      '../assets/sprites/indicators/cursor.png',
      { frameWidth: 32, frameHeight: 32, startFrame: 0, endFrame: 1 }
    );
  }

  public create() {
    this.marker = this.ctx.game.add.sprite(100, 100, 'indicator_move');
    this.marker.setOrigin(0, 0);
    const config = {
      key: 'cursor_anim',
      frames: this.ctx.game.anims.generateFrameNumbers('indicator_move', { start: 0, end: 1 }),
      frameRate: 1,
      repeat: -1
    };
    this.ctx.game.anims.create(config);
    this.marker.anims.play('cursor_anim');
    this.marker.visible = false;
  }
}
