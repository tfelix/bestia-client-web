import { Point, Px } from 'app/game/model';
import { ComponentType, FishingComponent, Entity } from 'app/game/entities';

import { Pointer } from './Pointer';
import { PointerManager } from './PointerManager';
import { EngineContext } from '../EngineContext';
import { PointerPriority } from './PointerPriority';
import { UIAtlas, UIConstants } from 'app/game/ui';

export class WoodChopPointer extends Pointer {

  private marker: Phaser.GameObjects.Image;

  constructor(
    manager: PointerManager,
    ctx: EngineContext
  ) {
    super(manager, ctx);
  }

  public onClick(pointer: Px, pos: Point, entity?: Entity) {
  }

  public reportPriority(px: Px, pos: Point, overEntity?: Entity): number {
    return PointerPriority.CHOP_WOOD;
  }
}
