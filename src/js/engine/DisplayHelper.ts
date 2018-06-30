import { MapHelper } from 'map';
import { Size, Point, Px } from 'model';

export class DisplayHelper {

  public static readonly sceneWidth = 800;
  public static readonly sceneHeight = 600;

  constructor(
    private readonly scene: Phaser.Scene
  ) {
  }

  public getScrollOffsetPx(): Px {
    return new Px(this.scene.cameras.main.scrollX, this.scene.cameras.main.scrollY);
  }

  public getDisplaySizeInTiles(): Size {
    const widthTiles = Math.ceil(DisplayHelper.sceneWidth / MapHelper.TILE_SIZE_PX);
    const heightTiles = Math.ceil(DisplayHelper.sceneHeight / MapHelper.TILE_SIZE_PX);
    return new Size(widthTiles, heightTiles);
  }

  public getScrollOffset(): Point {
    const camScrollX = Math.floor(
      this.scene.cameras.main.scrollX / MapHelper.TILE_SIZE_PX
    );
    const camScrollY = Math.floor(
      this.scene.cameras.main.scrollY / MapHelper.TILE_SIZE_PX
    );
    return new Point(camScrollX, camScrollY);
  }

  public getPointerWorldCoordinates(): Point {
    const camScrollX = Math.floor(this.scene.cameras.main.scrollX);
    const camScrollY = Math.floor(this.scene.cameras.main.scrollY);
    const pointerScreenX = this.scene.input.activePointer.position.x;
    const pointerScreenY = this.scene.input.activePointer.position.y;
    return MapHelper.pixelToPoint(camScrollX + pointerScreenX, pointerScreenY + camScrollY);
  }
}
