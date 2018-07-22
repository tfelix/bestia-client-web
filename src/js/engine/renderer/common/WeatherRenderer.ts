import { BaseCommonRenderer } from './BaseCommonRenderer';
import { EngineContext } from '../../EngineContext';
import { VisualDepth } from '../VisualDepths';
import { UIAtlas, UIConstants } from 'ui';
import { BlendModes } from 'phaser';

export class WeatherRenderer extends BaseCommonRenderer {

  private timer: any;

  private weatherGfx: Phaser.GameObjects.Graphics;
  private rainParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
  private rainEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  private screenRect = new Phaser.Geom.Rectangle(0, 0, this.ctx.helper.display.sceneWidth, this.ctx.helper.display.sceneHeight);

  constructor(
    private readonly ctx: EngineContext
  ) {
    super();
  }

  public create() {
    this.weatherGfx = this.ctx.game.add.graphics();
    this.weatherGfx.depth = VisualDepth.WEATHER_FX;
    this.weatherGfx.blendMode = Phaser.BlendModes.MULTIPLY;

    this.rainParticles = this.ctx.game.add.particles(UIAtlas, UIConstants.FX_RAIN);
    this.rainEmitter = this.rainParticles.createEmitter({
      x: 0,
      y: -10,
      frequency: 100,
      emitZone: { source: new Phaser.Geom.Rectangle(0, 0, this.ctx.helper.display.sceneWidth, 20) },
      speedY: { min: 150, max: 170 },
      quantity: 50,
      lifespan: 5000
    });
    this.rainEmitter.pause();
  }

  public update() {
    this.weatherGfx.clear();
    this.weatherGfx.fillStyle(this.makeColorFromWeatherAndLight(), 1);
    this.weatherGfx.fillRectShape(this.screenRect);

    const offset = this.ctx.helper.display.getScrollOffsetPx();

    this.weatherGfx.setPosition(offset.x, offset.y);
    this.rainEmitter.setPosition(offset.x, -10);

    this.makeRain();
    /*
    if (!this.timer) {
      this.timer = window.setTimeout(() => {
        this.makeLightning();
        this.timer = null;
      }, 3000);
    }*/
  }

  private makeRain() {
    const weather = this.ctx.data.weather;
    if (weather.rain === 0) {
      this.rainEmitter.pause();
    } else {
      this.rainEmitter.setFrequency(50);
      this.rainEmitter.setQuantity(30);
      this.rainEmitter.depthSort();
      this.rainEmitter.resume();
    }
  }

  private makeColorFromWeatherAndLight(): number {
    // Find out why dayProgress can not be set in the data field.
    const dayProgress = 0.5;
    const weather = this.ctx.data.weather;
    let brigtness = weather.brightness;
    if (weather.rain <= 1) {
      brigtness -= weather.rain * 0.3;
    } else {
      // Begins from 0.3 and reaches 1 on rain = 4
      brigtness -= 0.233 * weather.rain + 0.067;
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
    this.ctx.game.cameras.main.flash(1000);
  }

  public needsUpdate(): boolean {
    // TODO Find a better way to do this.
    return true;
  }
}
