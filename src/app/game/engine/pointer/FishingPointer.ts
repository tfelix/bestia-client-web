import { Point, Px } from 'app/game/model';
import { ComponentType, Entity } from 'app/game/entities';

import { Pointer } from './Pointer';
import { PointerManager } from './PointerManager';
import { EngineContext } from '../EngineContext';
import { PointerPriority } from './PointerPriority';

/**
 * Fishing Pointer gets active if there is a FishingComponent attached to
 * the player entity. It will prevent movement. Maybe the pointer should be renamed
 * in order to faciliate mutliple uses.
 */
export class FishingPointer extends Pointer {

  constructor(
    manager: PointerManager,
    ctx: EngineContext
  ) {
    super(manager, ctx);
  }

  public reportPriority(px: Px, pos: Point, overEntity?: Entity): number {
    const playerEntity = this.ctx.playerHolder.activeEntity;
    return (playerEntity && playerEntity.hasComponent(ComponentType.FISHING)) ? PointerPriority.FISHING : PointerPriority.NONE;
  }

  public activate() {
    this.ctx.cursorManager.hide();
  }

  public deactivate() {
    this.ctx.cursorManager.show();
  }
}
