import { CommonRenderer } from './CommonRenderer';
import { EngineContext } from '../../EngineContext';

export class BuildingInsideRenderer extends CommonRenderer {

  private isInsideRenderActive = false;

  constructor(
    private readonly ctx: EngineContext
  ) {
    super();
  }

  public needsUpdate(): boolean {
    const isPlayerInBuilding = this.ctx.collision.building.isInsideBuilding();

    // TODO We need an update if the player has moved since the last render as well.
    return this.isInsideRenderActive !== isPlayerInBuilding;
  }

  public update() {
    const isPlayerInBuilding = this.ctx.collision.building.isInsideBuilding();

    if (isPlayerInBuilding) {
      this.updateBuildingInside();
    } else {
      this.removeBuildingInside();
    }
     // Gets position of the player

    // Draw depending from the player lines towards the windows

    // Draw the room.
  }

  private updateBuildingInside() {
    this.isInsideRenderActive = true;
    this.ctx.gameScene.cameras.main.renderToTexture = false;
  }

  private removeBuildingInside() {
    this.isInsideRenderActive = false;
    this.ctx.gameScene.cameras.main.renderToTexture = true;
  }
}
