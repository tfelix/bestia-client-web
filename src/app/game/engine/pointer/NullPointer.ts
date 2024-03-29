import { Px, Point } from 'app/game/model';
import { Entity } from 'app/game/entities';

import { Pointer } from './Pointer';
import { PointerManager } from './PointerManager';
import { EngineContext } from '../EngineContext';
import { PointerPriority } from './PointerPriority';

export class NullPointer extends Pointer {
  constructor(
    manager: PointerManager,
    ctx: EngineContext
  ) {
    super(manager, ctx);
  }

  public allowOverwrite(): boolean {
    return true;
  }

  public reportPriority(px: Px, pos: Point, overEntity?: Entity): number {
    return PointerPriority.NONE;
  }
}
