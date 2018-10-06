import { Point, Size } from 'app/game/model';

import { MapHelper } from '../../MapHelper';
import { EngineContext } from '../../EngineContext';
import { BaseCommonRenderer } from './BaseCommonRenderer';
import { DisplayHelper } from '../../DisplayHelper';
import { VisualDepth } from '../VisualDepths';

export class CollisionCommonRenderer extends BaseCommonRenderer {

  private graphicsCollision: Phaser.GameObjects.Graphics | null = null;
  private rect = new Phaser.Geom.Rectangle(0, 0, MapHelper.TILE_SIZE_PX, MapHelper.TILE_SIZE_PX);

  private gameTileSize: Size;
  private displayHelper: DisplayHelper;

  constructor(
    private readonly context: EngineContext
  ) {
    super();
    this.gameTileSize = this.context.helper.display.getDisplaySizeInTiles();
    this.displayHelper = new DisplayHelper(this.context.game);
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

    const pxScrollOffset = this.displayHelper.getScrollOffsetPx();

    for (let y = 0; y < this.gameTileSize.height; y++) {
      for (let x = 0; x < this.gameTileSize.width; x++) {
        const px = MapHelper.pointToPixel(new Point(x, y));
        this.rect.x = px.x + pxScrollOffset.x;
        this.rect.y = px.y + pxScrollOffset.y;
        const hasCollision = this.context.collisionUpdater.hasCollision(x, y);
        if (hasCollision) {
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
