import { MapHelper } from '../../MapHelper';
import { EngineContext } from '../../EngineContext';
import { BaseCommonRenderer } from './BaseCommonRenderer';
import { VisualDepth } from '../VisualDepths';

export class GridCommonRenderer extends BaseCommonRenderer {

  private graphicsGrid: Phaser.GameObjects.Graphics | null = null;
  private line = new Phaser.Geom.Line(0, 0, 0, MapHelper.TILE_SIZE_PX);

  constructor(
    private readonly context: EngineContext
  ) {
    super();
  }

  public needsUpdate() {
    if (!this.context.config.debug.renderGrid) {
      if (this.graphicsGrid !== null) {
        this.clearGraphics();
      }
      return false;
    }

    return true;
  }

  public update() {
    this.prepareGraphics();
    this.renderCollision();
  }

  private renderCollision() {
    this.graphicsGrid.clear();

    const gameTileSize = this.context.helper.display.getDisplaySizeInTiles();

    const scrollOffset = this.context.helper.display.getScrollOffset();

    const gamePxWidth = (gameTileSize.width + 1) * MapHelper.TILE_SIZE_PX;
    const gamePxHeight = (gameTileSize.height + 1) * MapHelper.TILE_SIZE_PX;

    const startX = scrollOffset.x * MapHelper.TILE_SIZE_PX + 1;
    const startY = scrollOffset.y * MapHelper.TILE_SIZE_PX + 1;

    for (let y = -1; y < gameTileSize.height; y++) {
      const dy = y * MapHelper.TILE_SIZE_PX;

      this.graphicsGrid.beginPath();
      this.graphicsGrid.moveTo(startX, dy + startY);
      this.graphicsGrid.lineTo(startX + gamePxWidth, dy + startY);
      this.graphicsGrid.strokePath();
    }

    for (let x = -1; x <= gameTileSize.width; x++) {
      const dx = x * MapHelper.TILE_SIZE_PX;

      this.graphicsGrid.beginPath();
      this.graphicsGrid.moveTo(dx + startX, startY);
      this.graphicsGrid.lineTo(dx + startX, startY + gamePxHeight);
      this.graphicsGrid.strokePath();
    }
  }

  private prepareGraphics() {
    if (this.graphicsGrid) {
      return;
    }
    this.graphicsGrid = this.context.game.add.graphics({ lineStyle: { width: 2, color: 0xFFFFFF } });
    this.graphicsGrid.strokeLineShape(this.line);
    this.graphicsGrid.depth = VisualDepth.UI;
    this.graphicsGrid.alpha = 0.5;
  }

  private clearGraphics() {
    this.graphicsGrid.destroy();
    this.graphicsGrid = null;
  }
}
