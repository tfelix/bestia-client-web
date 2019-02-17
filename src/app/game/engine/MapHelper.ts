import { Point, Px, Vec2 } from 'app/game/model';

export class MapHelper {

  public static readonly TILE_SIZE_PX = 32;

  public static worldPxToSceneLocal(worldCamera: any, x: number, y: number): Px {
    const localX = (x - worldCamera.worldView.x) * worldCamera.zoom;
    const localY = (y - worldCamera.worldView.y) * worldCamera.zoom;

    return new Px(localX, localY);
  }

  public static pointToPixelCentered(p: Vec2): Px {
    return new Px(
      p.x * this.TILE_SIZE_PX + this.TILE_SIZE_PX / 2,
      p.y * this.TILE_SIZE_PX + this.TILE_SIZE_PX / 2
    );
  }

  public static pointToPixel(p: Vec2): Px {
    return new Px(
      p.x * this.TILE_SIZE_PX,
      p.y * this.TILE_SIZE_PX
    );
  }

  public static xyPointToPx(x: number, y: number): Px {
    return new Px(
      x * this.TILE_SIZE_PX,
      y * this.TILE_SIZE_PX
    );
  }

  public static pixelToPoint(xPx: number, yPx: number): Point {
    return new Point(
      Math.floor(xPx / this.TILE_SIZE_PX),
      Math.floor(yPx / this.TILE_SIZE_PX)
    );
  }

  public static getClampedTilePixelXY(xPx: number, yPx: number): Px {
    return new Px(
      Math.floor(xPx / this.TILE_SIZE_PX) * this.TILE_SIZE_PX,
      Math.floor(yPx / this.TILE_SIZE_PX) * this.TILE_SIZE_PX
    );
  }

  public static getWalkDuration(currentPos: Px, targetPosition: Px, walkspeed: number) {
    // Usual walkspeed is 1.4 tiles / s -> 0,74 s/tile.
    const length = currentPos.getDistance(targetPosition) / MapHelper.TILE_SIZE_PX;
    return Math.round((1 / 1.4) * length / walkspeed * 1000);
  }
}
