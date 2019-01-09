import * as LOG from 'loglevel';

import { Entity, FxComponent } from 'app/game/entities';
import { Point } from 'app/game/model';

import { RenderDelegate } from './RenderDelegate';
import { EngineContext } from '../../EngineContext';
import { getSpriteDescriptionFromCache, SpriteDescription, FxDescriptionData } from './SpriteDescription';
import { SpriteData } from './SpriteRenderer';

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
    return !(entity.data.fx && entity.data.fx.burningEmitter);
  }

  createGameData(entity: Entity, component: FxComponent) {
    const visualData = entity.data.visual;

    if (!visualData) {
      LOG.warn(`Entity ${entity} has no attached visual data (sprite). Can not attach BurnFx.`);
      entity.data.fx = { burningEmitter: [] };
      return;
    }

    const fxData = entity.data.fx || { burningEmitter: [] };

    const spriteDesc = getSpriteDescriptionFromCache(visualData.spriteName, this.ctx.gameScene);
    const burningAnchors = spriteDesc.fxData && spriteDesc.fxData.burning || [];

    if (!burningAnchors) {
      LOG.warn(`Sprite had no attached spriteDesc.fxData.burning data. Can not render fire.`);
      fxData.burningEmitter = [];
    }

    const fireSpawn = this.getFireSpawnPoints(visualData, spriteDesc);
    const fireEmitter = this.createFireParticle(fireSpawn);
    fxData.burningEmitter = fireEmitter;
    entity.data.fx = fxData;
  }

  updateGameData(entity: Entity, component: FxComponent) {
  }

  private getFireSpawnPoints(
    visualData: SpriteData,
    spriteDesc: SpriteDescription,
  ): Point {
    const offsets = spriteDesc.fxData && spriteDesc.fxData.burning || [];
    const i = Math.floor(Math.random() * offsets.length);

    const offset = new Point(offsets[i].x, offsets[i].y);

    const anchorX = visualData.sprite.x;
    const anchorY = visualData.sprite.y;

    const scaledOffsetX = offset.x * spriteDesc.scale;
    const scaledOffsetY = offset.y * spriteDesc.scale;

    const x = anchorX + scaledOffsetX;
    const y = anchorY + scaledOffsetY;

    return new Point(x, y);
  }

  private createFireParticle(pos: Point): Phaser.GameObjects.Particles.ParticleEmitter[] {


    const fire = this.ctx.gameScene.add.particles('fx_smoke_temp').createEmitter({
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

    const whiteSmoke = this.ctx.gameScene.add.particles('fx_smoke').createEmitter({
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

    const darkSmoke = this.ctx.gameScene.add.particles('fx_smoke').createEmitter({
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

    return [fire, whiteSmoke, darkSmoke];
  }
}
