import { CollisionMapUpdater, CollisionMap } from './CollisionMap';
import { EngineContext } from './EngineContext';

export class TilemapCollisionUpdater implements CollisionMapUpdater {

  constructor(
    private readonly ctx: EngineContext
  ) {
  }

  public updateMap(map: CollisionMap) {
    const scrollOffset = this.ctx.helper.display.getScrollOffset();
    const displaySize = this.ctx.helper.display.getDisplaySizeInTiles();

    for (let y = 0; y < displaySize.height; y++) {
      for (let x = 0; x < displaySize.width; x++) {
        this.ctx.data.tilemap.layers.forEach((layer: Phaser.Tilemaps.StaticTilemapLayer) => {
          const tile = layer.getTileAt(x + scrollOffset.x, y + scrollOffset.y);

          if (tile == null) {
            return;
          }

          const doesCollideOnTile = (tile.properties as any).collision || false;
          if (doesCollideOnTile) {
            map.setCollision(x, y, true);
          }
        });
      }
    }
  }
}
