import { Point, Size } from '../../../model';

import { MapHelper } from '../../MapHelper';
import { EngineContext } from '../../EngineContext';
import { BaseCommonRenderer } from './BaseCommonRenderer';
import { VisualDepth } from '../VisualDepths';

export class CollisionCommonRenderer extends BaseCommonRenderer {

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
    const pxScrollOffset = this.context.helper.display.getScrollOffsetPx();

    for (let y = 0; y < gameTileSize.height; y++) {
      for (let x = 0; x < gameTileSize.width; x++) {
        const hasCollision = this.context.collisionUpdater.hasCollision(x, y);
        if (hasCollision) {
          console.info(`Found collision: ${x}-${y}`);
          console.info(`Scroll Offset: ${JSON.stringify(pxScrollOffset)}`)
          const px = MapHelper.pointToPixel(new Point(x, y));
          this.rect.x = px.x + pxScrollOffset.x;
          this.rect.y = px.y + pxScrollOffset.y;
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
    this.graphicsCollision = this.context.game.add.graphics();
    this.graphicsCollision.depth = VisualDepth.UI;
    this.graphicsCollision.alpha = 0.5;
  }

  private clearData() {
    this.graphicsCollision.destroy();
    this.graphicsCollision = null;
  }
}
