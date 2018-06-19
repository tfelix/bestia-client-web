import { Pointer } from './Pointer';
import { PointerManager } from './PointerManager';
import { EngineContext } from '../EngineContext';
import { PointerPriority } from './PointerPriority';
import { Px } from 'model';
import { Entity } from 'entities';

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

  public checkActive(position: Px, entity?: Entity): number {
    return PointerPriority.NONE;
  }
}
