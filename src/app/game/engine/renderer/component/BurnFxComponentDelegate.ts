import { Entity, FxComponent } from 'app/game/entities';
import { Point } from 'app/game/model';

import { SubComponentRenderer } from './SubComponentRenderer';
import { RenderDelegate } from './RenderDelegate';
import { EngineContext } from '../../EngineContext';
import { getSpriteDescriptionFromCache } from './SpriteDescription';

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
    return !entity.data.fx;
  }

  createGameData(entity: Entity, component: FxComponent) {
    const x = entity.data.visual.sprite.x;
    const y = entity.data.visual.sprite.y;
    const spriteDesc = getSpriteDescriptionFromCache(entity.data.visual.spriteName, this.ctx.game);
    // entity.data.visual.

    this.createFireParticle(new Point(x, y));
    // TODO Save better data.
    entity.data.fx = { burning: true };
  }

  updateGameData(entity: Entity, component: FxComponent) {
  }

  private createFireParticle(pos: Point) {
    const fire = this.ctx.game.add.particles('fx_smoke_temp').createEmitter({
      x: pos.x,
      y: pos.y,
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
      x: pos.x,
      y: pos.y,
      speed: { min: 20, max: 100 },
      angle: { min: -85, max: -95 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0, end: 0.5 },
      lifespan: 2000,
    });
    whiteSmoke.manager.depth = 9000;

    const darkSmoke = this.ctx.game.add.particles('fx_smoke').createEmitter({
      x: pos.x,
      y: pos.y,
      speed: { min: 20, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0, end: 0.1 },
      lifespan: 2000,
      active: false
    });

    fire.onParticleDeath(particle => {
      darkSmoke.setPosition(particle.x, particle.y + 40);
      whiteSmoke.setPosition(particle.x, particle.y + 40);
      darkSmoke.emitParticle();
      whiteSmoke.emitParticle();
    });
  }
}