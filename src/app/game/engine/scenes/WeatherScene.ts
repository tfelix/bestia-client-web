import * as LOG from 'loglevel';
import { SceneNames } from './SceneNames';
import { VisualDepth } from '../renderer/VisualDepths';
import { EngineContext } from '../EngineContext';

export class WeatherScene extends Phaser.Scene {

  private cloudShadowImage: Phaser.GameObjects.Image;
  private ctx: EngineContext;

  constructor() {
    super({
      key: SceneNames.WEATHER
    });
  }

  public init(engineCtx: EngineContext) {
    this.ctx = engineCtx;
  }

  public preload(): void {
    LOG.debug('WeatherScene preload()');
    this.load.image('cloud_shadows', '../assets/fx/clouds.png');
  }

  public create() {
    this.cloudShadowImage = this.add.image(0, 0, 'cloud_shadows');
    this.cloudShadowImage.setScale(1);
    this.cloudShadowImage.setDepth(VisualDepth.WEATHER_FX);
  }

  public update(): void {
  }
}
