import { EngineContext } from '../../EngineContext';
import { BaseCommonRenderer } from './BaseCommonRenderer';
import { CollisionCommonRenderer } from './CollisionCommonRenderer';
import { DebugInfoRenderer } from './DebugInfoRenderer';
import { UIModalRenderer } from './UIModalRenderer';
import { GridCommonRenderer } from './GridCommonRenderer';

export class CommonRenderManager implements RenderStatistics {

  private renderer: BaseCommonRenderer[] = [];

  public static standardInstance(ctx: EngineContext): CommonRenderManager {
    const manager = new CommonRenderManager();

    manager.addRenderer(new CollisionCommonRenderer(ctx));
    manager.addRenderer(new DebugInfoRenderer(ctx));
    manager.addRenderer(new GridCommonRenderer(ctx));
    manager.addRenderer(new UIModalRenderer(ctx));

    return manager;
  }

  public addRenderer(renderer: BaseCommonRenderer) {
    this.renderer.push(renderer);
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
