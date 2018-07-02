import { BaseCommonRenderer } from './BaseCommonRenderer';
import { EngineContext } from '../../EngineContext';

export class WeatherRenderer extends BaseCommonRenderer {

  constructor(ctx: EngineContext) {
    super();

    const gameWidth = ctx.helper.display.sceneWidth;
    const gameHeight = ctx.helper.display.sceneHeight;
  }

  public update() {
    // TODO Implement weather rendering.
  }

  public needsUpdate(): boolean {
    return false;
  }
}
