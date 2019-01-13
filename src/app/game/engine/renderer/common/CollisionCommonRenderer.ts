import { Point } from '../../../model';

import { MapHelper } from '../../MapHelper';
import { EngineContext } from '../../EngineContext';
import { CommonRenderer } from './CommonRenderer';
import { VisualDepth } from '../VisualDepths';

export class CollisionCommonRenderer extends CommonRenderer {

  private graphicsCollision: Phaser.GameObjects.Graphics | null = null;
  private rect = new Phaser.Geom.Rectangle(0, 0, MapHelper.TILE_SIZE_PX, MapHelper.TILE_SIZE_PX);

  constructor(
    private readonly context: EngineContext
  ) {
    super();
  }

  public needsUpdate() {
    // TODO Handle this better.
    return true;
  }

  public update() {
    if (!this.context.config.debug.renderCollision) {
      if (this.graphicsCollision !== null) {
        this.clearData();
      }
      return;
    } else {
      this.renderCollision();
    }
  }

  private renderCollision() {
    this.prepareData();

    this.graphicsCollision.clear();

    const gameTileSize = this.context.helper.display.getDisplaySizeInTiles();
    const scrollOffset = this.context.helper.display.getScrollOffset();

    const startX = scrollOffset.x * MapHelper.TILE_SIZE_PX;
    const startY = scrollOffset.y * MapHelper.TILE_SIZE_PX;

    for (let y = 0; y < gameTileSize.height; y++) {
      for (let x = 0; x < gameTileSize.width; x++) {
        const hasCollision = this.context.collision.map.hasCollision(x, y);
        if (hasCollision) {
          const px = MapHelper.pointToPixel(new Point(x, y));
          this.rect.x = px.x + startX;
          this.rect.y = px.y + startY;
          this.graphicsCollision.fillStyle(0x0000FF, 1);
          this.graphicsCollision.fillRectShape(this.rect);
        }
      }
    }
  }

  private prepareData() {
    if (this.graphicsCollision) {
      return;
    }
    this.graphicsCollision = this.context.gameScene.add.graphics();
    this.graphicsCollision.depth = VisualDepth.UI;
    this.graphicsCollision.alpha = 0.5;
  }

  private clearData() {
    this.graphicsCollision.destroy();
    this.graphicsCollision = null;
  }
}
