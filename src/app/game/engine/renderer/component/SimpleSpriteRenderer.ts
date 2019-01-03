import { MultiSpriteRenderer } from './MultiSpriteRenderer';
import { EngineContext } from '../..';
import { SpriteType } from './SpriteDescription';

/**
 * WARNING: This is currently the same as MultiSpriteRenderer and must be refactored unto a own
 * unit.
 */
export class SimpleSpriteRenderer extends MultiSpriteRenderer {

  constructor(
    ctx: EngineContext
  ) {
    super(ctx);
  }

  public supportedType(): SpriteType {
    return SpriteType.SIMPLE;
  }
}
