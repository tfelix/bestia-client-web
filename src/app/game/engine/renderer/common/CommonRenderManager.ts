import { EngineContext } from '../../EngineContext';
import { BaseCommonRenderer } from './BaseCommonRenderer';
import { CollisionCommonRenderer } from './CollisionCommonRenderer';
import { DebugInfoRenderer } from './DebugInfoRenderer';
import { UIModalRenderer } from './UIModalRenderer';
import { WeatherRenderer } from './WeatherRenderer';
import { GridCommonRenderer } from './GridCommonRenderer';

export class CommonRenderManager implements RenderStatistics {

  private renderer: BaseCommonRenderer[] = [];

  constructor(
    private readonly ctx: EngineContext
  ) {

    this.renderer.push(new CollisionCommonRenderer(this.ctx));
    this.renderer.push(new DebugInfoRenderer(this.ctx));
    this.renderer.push(new GridCommonRenderer(this.ctx));

    this.renderer.push(new UIModalRenderer(this.ctx));
    this.renderer.push(new WeatherRenderer(this.ctx));
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
