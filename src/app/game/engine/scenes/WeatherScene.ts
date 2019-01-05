import * as LOG from 'loglevel';
import { SceneNames } from './SceneNames';
import { EngineContext } from '../EngineContext';
import { CommonRenderManager, WeatherRenderer } from '../renderer';

export class WeatherScene extends Phaser.Scene {

  private ctx: EngineContext;
  private weatherRenderManager: CommonRenderManager;

  constructor() {
    super({
      key: SceneNames.WEATHER
    });
  }

  public init(engineCtx: EngineContext) {
    this.ctx = engineCtx;

    this.weatherRenderManager = new CommonRenderManager();
    this.weatherRenderManager.addRenderer(new WeatherRenderer(this.ctx, this));
  }

  public preload(): void {
    LOG.debug('WeatherScene preload()');
    this.load.image('cloud_shadows', '../assets/fx/clouds.png');
  }

  public create() {
    this.weatherRenderManager.create();
  }

  public update(): void {
    this.weatherRenderManager.update();
  }
}
