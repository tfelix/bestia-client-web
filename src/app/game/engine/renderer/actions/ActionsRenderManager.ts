import { ActionsRenderer } from './ActionsRenderer';
import { DamageActionsRenderer } from './DamageActionsRenderer';
import { ChatActionsRenderer } from './ChatActionsRenderer';
import { EngineContext } from '../../EngineContext';

/**
 * The Actions, Common and EntityRenderManager are fairly identically and could be unified.
 */
export class ActionsRendererManager implements RenderStatistics {

  private renderer: ActionsRenderer[] = [];

  constructor(
    private readonly ctx: EngineContext
  ) {

    this.renderer.push(new DamageActionsRenderer(ctx.gameScene));
    this.renderer.push(new ChatActionsRenderer(ctx));
  }

  public update() {
    for (const e of this.ctx.entityStore.entities.values()) {
      this.renderer.forEach(r => {
        if (r.needsUpdate(e)) {
          r.update(e);
        }
      });
      e.actions = [];
    }
  }

  public getLastUpdateDetails(): [[string, number]] {
    return null;
  }

  public getLastUpdateTimeMs(): number {
    return this.renderer
      .map(x => x.getLastUpdateTimeMs())
      .reduce((prev, val) => prev + val);
  }
}
