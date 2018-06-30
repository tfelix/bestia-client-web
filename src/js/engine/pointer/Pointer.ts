import { PointerManager } from './PointerManager';
import { EngineContext } from '../EngineContext';
import { Px } from 'model';
import { Entity } from 'entities';

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

	/**
	 * Checks if this indicator can be overwritten by the new one. Usually this
	 * is the default behaviour.
	 *
	 * @param indicator - The new indicator intended to override the currently active one.
	 */
  public allowOverwrite(otherPointer: Pointer) {
    return true;
  }

  public create() {
    // no op.
  }

  public load(loader: Phaser.Loader.LoaderPlugin) {
    // no op.
  }

  /**
   * Shortcut method so set itself active.
   */
  protected setSelfActive() {
    return this.manager.requestActive(this);
  }

  /**
   * Checks if the pointer should activate when under the sprite.
   */
  public abstract checkActive(position: Px, mouseoverEntity?: Entity): number;

  public updatePosition(position: Px, mouseoverEntity?: Entity) {
    // no op.
  }

  public onClick(position: Px, clickedEntity?: Entity) {
    // no op.
  }
}
