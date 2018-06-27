import { Point, Px } from 'model';
import { MapHelper } from 'map/MapHelper';

import { Pointer } from './Pointer';
import { PointerManager } from './PointerManager';
import { EngineContext } from '../EngineContext';
import { Entity } from 'entities';
import { PointerPriority } from './PointerPriority';
import { ComponentType } from 'entities/components';

export class MovePointer extends Pointer {

  private marker: Phaser.GameObjects.Sprite;

  constructor(
    manager: PointerManager,
    ctx: EngineContext
  ) {
    super(manager, ctx);
  }

  public checkActive(pointer: Px, entity?: Entity): number {
    return PointerPriority.MOVE;
  }

  public activate() {
    this.marker.visible = true;
  }

  public onClick(pointer: Px, entity?: Entity) {
    if (!entity) {
      return;
    }

    if (!this.canMove(entity)) {
      return;
    }

    const offset = this.ctx.helper.display.getScrollOffset();
    const point = MapHelper.pixelToPoint(pointer.x, pointer.y).minus(offset);

    if (this.ctx.collisionUpdater.hasCollision(point.x, point.y)) {

    } else {
      this.ctx.helper.move.moveTo(pointer);
    }
  }

  private canMove(entity: Entity): boolean {
    return !entity.hasComponent(ComponentType.PERFORM);
  }

  public updatePosition(px: Px) {
    this.marker.setPosition(px.x, px.y);

    const offset = this.ctx.helper.display.getScrollOffset();
    const point = MapHelper.pixelToPoint(px.x, px.y).minus(offset);
    this.marker.visible = !this.isNotWalkable(point);
  }

  private isNotWalkable(point: Point) {
    return this.ctx.collisionUpdater.hasCollision(point.x, point.y);
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
