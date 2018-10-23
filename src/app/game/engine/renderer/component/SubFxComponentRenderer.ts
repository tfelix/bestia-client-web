import { ComponentType, FxComponent } from 'app/game/entities';

import { SubComponentRenderer } from './SubComponentRenderer';
import { EngineContext } from '../../EngineContext';
import { BurnFxComponentDelegate } from './BurnFxComponentDelegate';

export interface FxData {
  burningEmitter: Phaser.GameObjects.Particles.ParticleEmitter[];
}

export class SubFxComponentRenderer extends SubComponentRenderer<FxComponent>  {

  constructor(
    ctx: EngineContext,
  ) {
    super(ctx.game);

    this.addSubRenderer(new BurnFxComponentDelegate(ctx));
  }

  get supportedComponent(): ComponentType {
    return ComponentType.FX;
  }
}
