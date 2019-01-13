import { CommonRenderer } from './CommonRenderer';
import { EngineContext } from '../../EngineContext';

export class BuildingInsideRenderer extends CommonRenderer {

  constructor(
    private readonly ctx: EngineContext
  ) {
    super();
  }

  public needsUpdate(): boolean {
    return false;
  }

  public update() {
    throw new Error('Method not implemented.');

    // Gets position of the player

    // Draw depending from the player lines towards the windows

    // Draw the room.
  }
}
