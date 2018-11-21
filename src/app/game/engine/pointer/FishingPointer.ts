import { Point, Px } from 'app/game/model';
import { ComponentType, FishingComponent, Entity } from 'app/game/entities';

import { Pointer } from './Pointer';
import { PointerManager } from './PointerManager';
import { EngineContext } from '../EngineContext';
import { PointerPriority } from './PointerPriority';
import { UIAtlas, UIConstants } from 'app/game/ui';

/**
 * Fishing Pointer gets active if there is a FishingComponent attached to
 * the player entity.
 */
export class FishingPointer extends Pointer {

  private marker: Phaser.GameObjects.Image;

  constructor(
    manager: PointerManager,
    ctx: EngineContext
  ) {
    super(manager, ctx);
  }

  public onClick(pointer: Px, pos: Point, entity?: Entity) {
    const fishingComponent = this.ctx.playerHolder.activeEntity.getComponent(ComponentType.FISHING) as FishingComponent;
    if (!fishingComponent) {
      return;
    }

    fishingComponent.hasClickedFishingAction = true;
  }

  public updatePointerPosition(px: Px, pos: Point, overEntity?: Entity) {
    this.marker.setPosition(px.x, px.y);
  }

  public reportPriority(px: Px, pos: Point, overEntity?: Entity): number {
    const playerEntity = this.ctx.playerHolder.activeEntity;
    return (playerEntity.hasComponent(ComponentType.FISHING)) ? PointerPriority.FISHING : PointerPriority.NONE;
  }

  public activate() {
    this.ctx.cursorManager.hide();
    this.marker = this.ctx.game.add.image(0, 0, UIAtlas, UIConstants.ICON_FISHING);
  }

  public deactivate() {
    this.ctx.cursorManager.show();
    this.marker.destroy();
    this.marker = null;
  }
}