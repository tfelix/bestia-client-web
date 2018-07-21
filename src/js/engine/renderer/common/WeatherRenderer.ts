import { BaseCommonRenderer } from './BaseCommonRenderer';
import { EngineContext } from '../../EngineContext';
import { WeatherScene } from 'scenes/WeatherScene';
import { SceneNames } from 'scenes/SceneNames';

export class WeatherRenderer extends BaseCommonRenderer {

  private timer: any;
  private weatherScene: WeatherScene;

  private weatherGfx: Phaser.GameObjects.Graphics;
  private screenRect = new Phaser.Geom.Rectangle(0, 0, this.ctx.helper.display.sceneWidth, this.ctx.helper.display.sceneHeight);

  constructor(
    private readonly ctx: EngineContext
  ) {
    super();

    this.weatherScene = this.ctx.game.scene.get(SceneNames.WEATHER) as WeatherScene;
  }

  public create() {
    this.weatherGfx = this.weatherScene.add.graphics();
    this.weatherGfx.blendMode = Phaser.BlendModes.MULTIPLY;
  }

  public update() {
    this.weatherGfx.clear();
    this.weatherGfx.fillStyle(this.makeColorFromWeatherAndLight(), 1);
    this.weatherGfx.fillRectShape(this.screenRect);

    /*
    if (!this.timer) {
      this.timer = window.setTimeout(() => {
        this.makeLightning();
        this.timer = null;
      }, 3000);
    }*/
  }

  private makeColorFromWeatherAndLight(): number {
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
