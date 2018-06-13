import { EngineContext } from 'engine/EngineContext';
import { BaseCommonRenderer } from './BaseCommonRenderer';
import { CollisionCommonRenderer } from './CollisionCommonRenderer';
import { DebugInfoRenderer } from './DebugInfoRenderer';

export class CommonRenderManager implements RenderStatistics {

  private renderer: BaseCommonRenderer[] = [];

  constructor(
    private readonly ctx: EngineContext
  ) {

    this.renderer.push(new CollisionCommonRenderer(ctx));
    this.renderer.push(new DebugInfoRenderer(ctx));
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
