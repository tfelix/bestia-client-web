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
    // TODO Implement weather rendering.
    this.weatherGfx.clear();
    this.weatherGfx.fillStyle(this.makeColorFromWeatherAndLight(), 0.8);
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
    return 0x00FF00;
  }

  private makeLightning() {
    this.ctx.game.cameras.main.flash(1000);
  }

  public needsUpdate(): boolean {
    // TODO Find a better way to do this.
    return true;
  }
}
