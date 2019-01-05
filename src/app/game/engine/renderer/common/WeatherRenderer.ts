import { UIAtlasBase, UIConstants, UIAtlasFx } from 'app/game/ui';

import { BaseCommonRenderer } from './BaseCommonRenderer';
import { EngineContext } from '../../EngineContext';
import { VisualDepth } from '../VisualDepths';

/**
 * Its probably better to exchange data between the scenes via the
 * PhaserJs registry: https://labs.phaser.io/edit.html?src=src\scenes\registry%20data%20exchange%20es6.js
 * instead of sharing it via the global object. Therefore we can listen to changes
 * and update the weather renderer accordingly.
 */
export class WeatherRenderer extends BaseCommonRenderer {

  private cloudShadowImage: Phaser.GameObjects.Image;
  private weatherGfx: Phaser.GameObjects.Graphics;
  private rainParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
  private rainEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private lightningEvent: Phaser.Time.TimerEvent;

  private screenRect = new Phaser.Geom.Rectangle(0, 0, this.ctx.helper.display.sceneWidth, this.ctx.helper.display.sceneHeight);

  constructor(
    private readonly ctx: EngineContext,
    private readonly scene: Phaser.Scene
  ) {
    super();
  }

  public create() {
    this.ctx.data.dayProgress = 0.5;
    this.ctx.data.weather.rainIntensity = 0;

    this.cloudShadowImage = this.scene.add.image(0, 0, 'cloud_shadows');
    this.cloudShadowImage.blendMode = Phaser.BlendModes.MULTIPLY;
    this.cloudShadowImage.setScale(4);
    this.cloudShadowImage.alpha = 0.3;
    this.cloudShadowImage.depth = VisualDepth.WEATHER_FX;

    this.weatherGfx = this.scene.add.graphics();
    this.weatherGfx.depth = VisualDepth.WEATHER_FX;
    this.weatherGfx.blendMode = Phaser.BlendModes.MULTIPLY;

    this.rainParticles = this.scene.add.particles(UIAtlasFx, UIConstants.FX_RAIN);

    this.rainEmitter = this.rainParticles.createEmitter({
      x: 0,
      y: -10,
      emitZone: { source: new Phaser.Geom.Rectangle(0, 0, this.ctx.helper.display.sceneWidth, 20) },
      speedY: { min: 300, max: 400 },
      frequency: 1,
      quantity: 10,
      rotate: -40,
      scale: { min: 0.5, max: 0.8 },
      angle: 330,
      lifespan: { min: 10, max: 4000 }
    });
    this.rainEmitter.manager.depth = VisualDepth.WEATHER_FX;
    this.rainEmitter.pause();
  }

  public update() {
    this.weatherGfx.clear();
    this.weatherGfx.fillStyle(this.makeColorFromWeatherAndLight(), 1);
    this.weatherGfx.fillRectShape(this.screenRect);

    this.makeRain();
    this.makeLightning();
  }

  private makeRain() {
    const weather = this.ctx.data.weather;
    if (weather.rainIntensity === 0) {
      this.rainEmitter.pause();
    } else {
      this.rainEmitter.resume();
    }
  }

  private makeColorFromWeatherAndLight(): number {
    const dayProgress = this.ctx.data.dayProgress;
    const weather = this.ctx.data.weather;
    let brigtness = weather.sunBrigthness;
    if (weather.rainIntensity <= 1) {
      brigtness -= weather.rainIntensity * 0.3;
    } else {
      // Begins from 0.3 and reaches 1 on rain = 4
      brigtness -= 0.233 * weather.rainIntensity + 0.067;
    }
    brigtness = Phaser.Math.Clamp(brigtness, 0, 10);

    let r = 0xFF * brigtness;
    let g = 0xFF * brigtness;
    let b = 0xFF * brigtness;

    const daylightRedshift = Math.pow(dayProgress - 0.5, 2);
    r += r * daylightRedshift;
    g += g * daylightRedshift * 0.2;
    b += b * daylightRedshift * 0.2;

    r = Phaser.Math.Clamp(r, 0, 255);
    g = Phaser.Math.Clamp(g, 0, 255);
    b = Phaser.Math.Clamp(b, 0, 255);

    return r << 16 | g << 8 | b;
  }

  private makeLightning() {
    const weather = this.ctx.data.weather;
    if (weather.rainIntensity < 0.5 || this.lightningEvent && !this.lightningEvent.hasDispatched) {
      return;
    }

    const lightningEventScale = 1 / (Math.log(weather.rainIntensity + 0.1) + 1);
    const nextLightningMs = 1000 * lightningEventScale * Phaser.Math.Between(12, 22);
    this.lightningEvent = this.scene.time.delayedCall(nextLightningMs, () => this.ctx.game.cameras.main.flash(800), [], this);
  }

  public needsUpdate(): boolean {
    // TODO Find a better way to do this.
    return true;
  }
}
