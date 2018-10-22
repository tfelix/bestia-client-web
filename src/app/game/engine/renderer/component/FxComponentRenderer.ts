import { ComponentType, Entity, FxComponent } from 'app/game/entities';
import { Point } from 'app/game/model';

import { DelegateComponentRenderer } from './DelegateComponentRenderer';
import { RenderDelegate } from './RenderDelegate';
import { EngineContext } from '../../EngineContext';
import { MapHelper } from '../../MapHelper';

export interface FxData {
  burning: any;
}

export class BurnFxComponentDelegate extends RenderDelegate<FxComponent> {

  constructor(
    private readonly ctx: EngineContext
  ) {
    super();
  }

  public rendersComponent(component: FxComponent): boolean {
    return component.fxTags.has('BURNING');
  }

  public hasNotSetup(entity: Entity, component: FxComponent): boolean {
    return !!entity.data.fx;
  }

  createGameData(entity: Entity, component: FxComponent) {
  }

  updateGameData(entity: Entity, component: FxComponent) {
  }

  private createFireParticle(pos: Point) {
    const px = MapHelper.pointToPixel(pos);

    const fire = this.ctx.game.add.particles('fx_smoke_temp').createEmitter({
      x: px.x,
      y: px.y,
      speed: { min: 80, max: 160 },
      angle: { min: -85, max: -95 },
      scale: { start: 0, end: 0.5, ease: 'Back.easeOut' },
      alpha: { start: 1, end: 0, ease: 'Quart.easeOut' },
      blendMode: Phaser.BlendModes.ADD,
      lifespan: 1000
    });
    fire.manager.depth = 10000;

    const whiteSmoke = this.ctx.game.add.particles('fx_smoke').createEmitter({
      frames: ['flame_02.png'],
      x: px.x,
      y: px.y,
      speed: { min: 20, max: 100 },
      angle: { min: -85, max: -95 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0, end: 0.5 },
      lifespan: 2000,
    });
    whiteSmoke.reserve(1000);

    const darkSmoke = this.ctx.game.add.particles('fx_smoke').createEmitter({
      x: px.x,
      y: px.y,
      speed: { min: 20, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0, end: 0.1 },
      lifespan: 2000,
      active: false
    });
    darkSmoke.reserve(1000);

    fire.onParticleDeath(particle => {
      darkSmoke.setPosition(particle.x, particle.y + 40);
      whiteSmoke.setPosition(particle.x, particle.y + 40);
      darkSmoke.emitParticle();
      whiteSmoke.emitParticle();
    });
  }
}

export class FxComponentRenderer extends DelegateComponentRenderer<FxComponent>  {

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
