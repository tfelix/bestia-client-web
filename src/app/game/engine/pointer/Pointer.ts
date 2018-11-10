import { Px, Point } from 'app/game/model';
import { Entity } from 'app/game/entities';

import { PointerManager } from './PointerManager';
import { EngineContext } from '../EngineContext';

/**
 * Basic indicator for visualization of the mouse pointer. This visualization is
 * changed depending on in which state of the game the user is. While using an
 * item for example or an attack the appearence of the pointer will change.
 */
export abstract class Pointer {

  constructor(
    protected readonly manager: PointerManager,
    protected readonly ctx: EngineContext
  ) {
  }

  public activate() {
    // no op.
  }

  public deactivate() {
    // no op.
  }

  public create() {
    // no op.
  }

  public load() {
    // no op.
  }

  /**
   * Reports the current pointer priority. The pointer with the highest priority will
   * get activated.
   */
  public abstract reportPriority(px: Px, pos: Point, overEntity?: Entity): number;

  public updatePointerPosition(px: Px, pos: Point, overEntity?: Entity) {
    // no op.
  }

  public onClick(position: Px, pos: Point, clickedEntity?: Entity) {
    // no op.
  }
}
