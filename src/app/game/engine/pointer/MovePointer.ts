import { Point, Px } from 'app/game/model';
import { ComponentType, PerformComponent } from 'app/game/entities';

import { MapHelper } from '../MapHelper';
import { Pointer } from './Pointer';
import { PointerManager } from './PointerManager';
import { EngineContext } from '../EngineContext';
import { Entity } from 'entities';
import { PointerPriority } from './PointerPriority';
import { VisualDepth } from '../renderer/VisualDepths';

export class MovePointer extends Pointer {
  private marker: Phaser.GameObjects.Sprite;

  constructor(
    manager: PointerManager,
    ctx: EngineContext
  ) {
    super(manager, ctx);
  }

  public activate() {
    this.marker.visible = true;
  }

  public deactivate() {
    this.marker.visible = false;
  }

  public onClick(pointer: Px, pos: Point, entity?: Entity) {
    if (!this.canMove(this.ctx.playerHolder.activeEntity)) {
      return;
    }

    if (!this.isNotWalkable(pointer)) {
      this.ctx.helper.move.moveToPixel(pointer);
    }
  }

  private canMove(entity: Entity): boolean {
    const performComp = entity.getComponent(ComponentType.PERFORM) as PerformComponent;
    return performComp && performComp.canMove || true;
  }

  public updatePointerPosition(px: Px, pos: Point, overEntity?: Entity) {
    this.marker.setPosition(px.x, px.y);
    this.marker.visible = !this.isNotWalkable(px);
  }

  public reportPriority(px: Px, pos: Point, overEntity?: Entity): number {
    return PointerPriority.MOVE;
  }

  private isNotWalkable(pointerPx: Px) {
    const offset = this.ctx.helper.display.getScrollOffset();
    const point = MapHelper.pixelToPoint(pointerPx.x, pointerPx.y).minus(offset);
    return this.ctx.collision.map.hasCollision(point.x, point.y);
  }

  public load() {
    this.ctx.gameScene.load.spritesheet(
      'indicator_move',
      '../assets/sprites/indicators/cursor.png',
      { frameWidth: 32, frameHeight: 32, startFrame: 0, endFrame: 1 }
    );
  }

  public create() {
    this.marker = this.ctx.gameScene.add.sprite(100, 100, 'indicator_move');
    this.marker.setOrigin(0, 0);
    this.marker.depth = VisualDepth.UI_UNDER_CURSOR;
    const config = {
      key: 'cursor_anim',
      frames: this.ctx.gameScene.anims.generateFrameNumbers('indicator_move', { start: 0, end: 1 }),
      frameRate: 1,
      repeat: -1
    };
    this.ctx.gameScene.anims.create(config);
    this.marker.anims.play('cursor_anim');
    this.marker.visible = false;
  }
}
