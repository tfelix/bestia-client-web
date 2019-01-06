import * as LOG from 'loglevel';
import { SceneNames } from './SceneNames';
import { EngineContext } from '../EngineContext';
import { CommonRenderManager, WeatherRenderer } from '../renderer';

class TestPipeline extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline {

  constructor(game: Phaser.Game) {
    super({
      game: game,
      renderer: game.renderer,
      fragShader: game.cache.shader.get('noise')
    });
  }
}

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
    this.load.image('cloud_shadows', '../assets/fx/clouds.png');
    this.load.glsl('blur', '../assets/shader/blur.glsl');
    this.load.glsl('noise', '../assets/shader/noise.glsl');
  }

  public create() {
    const customPipeline = (this.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer).addPipeline('Custom', new TestPipeline(this.game));
    customPipeline.setFloat2('u_resolution', this.game.config.width as number, this.game.config.height as number);
    // customPipeline.setFloat1('radius', 3.0);
    // customPipeline.setFloat2('dir', 1.0, 1.0);

    // const clouds = this.add.image(0, 0, 'cloud_shadows');
    const circle = this.add.graphics();
    // circle.fillCircle(this.game.config.width / 2, this.game.config.height / 2, 100);
    // clouds.setScale(2);
    // clouds.setPipeline('Custom');
    // this.cameras.main.setPipeline(customPipeline);
    // this.cameras.main.setRenderToTexture('Custom');

    this.weatherRenderManager.create();
  }

  public update(): void {
    this.weatherRenderManager.update();
  }
}
