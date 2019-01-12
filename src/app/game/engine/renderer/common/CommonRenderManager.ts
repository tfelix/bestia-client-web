import { EngineContext } from '../../EngineContext';
import { CommonRenderer } from './CommonRenderer';
import { CollisionCommonRenderer } from './CollisionCommonRenderer';
import { DebugInfoRenderer } from './DebugInfoRenderer';
import { UiModalRenderer } from './UiModalRenderer';
import { GridCommonRenderer } from './GridCommonRenderer';
import { WeatherRenderer } from './WeatherRenderer';
import { SceneNames } from '../../scenes/SceneNames';

/**
 * The Actions, Common and EntityRenderManager are fairly identically and could be unified.
 */
export class CommonRenderManager implements RenderStatistics {

  private renderer: CommonRenderer[] = [];

  constructor(ctx: EngineContext) {
    this.addRenderer(new CollisionCommonRenderer(ctx));
    this.addRenderer(new DebugInfoRenderer(ctx));
    this.addRenderer(new GridCommonRenderer(ctx));
    this.addRenderer(new UiModalRenderer(ctx));
    this.addRenderer(new WeatherRenderer(ctx, ctx.gameScene.scene.get(SceneNames.WEATHER)));
  }

  public addRenderer(renderer: CommonRenderer) {
    this.renderer.push(renderer);
  }

  public preload() {
    this.renderer.forEach(r => r.preload());
  }

  public create() {
    this.renderer.forEach(r => r.create());
  }

  public update() {
    this.renderer.forEach(r => {
      if (r.needsUpdate()) {
        r.update();
      }
    });
  }

  public getLastUpdateDetails(): [[string, number]] {
    return null;
  }

  public getLastUpdateTimeMs(): number {
    return 0;
  }
}
