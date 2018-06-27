import { Point, Size } from 'model';
import { SpriteDescription } from 'engine/renderer';

export class SpriteCollision {

  private spriteSizePoints: Size;
  private localOffset: Point;
  private collision: number[][];

  constructor(
    private readonly position: Point,
    private readonly spriteDescription: SpriteDescription
  ) {
    const collision = spriteDescription.collision || [[0]];
    const height = collision.length;
    const width = collision[0].length;
    this.spriteSizePoints = new Size(width, height);
    this.collision = collision;

    const offsetX = Math.ceil(width * spriteDescription.anchor.x) - 1;
    const offsetY = Math.ceil(height * spriteDescription.anchor.y) - 1;
    this.localOffset = new Point(offsetX, offsetY);
  }

  /**
   * We walk into each direction possible and find the shortest direction towards the start point which
   * is walkable.
   */
  public nextNonCollision(start: Point, target: Point): Point {
    if (this.hasCollision(target)) {
      return target;
    }

    const dx = Math.abs(start.x - target.x);
    const sx = target.x < start.x ? 1 : -1;
    const dy = -Math.abs(start.y - target.y);
    const sy = target.y < start.y ? 1 : -1;
    let err = dx + dy;
    let e2 = 0;

    let tx = target.x;
    let ty = target.y;

    while (1) {
      if (this.hasCollision(new Point(tx, ty))) {
        break;
      }
      e2 = 2 * err;
      if (e2 > dy) {
        err += dy;
        tx += sx;
      }
      if (e2 < dx) {
        err += dx;
        ty += sy;
      }
    }

    return new Point(tx, ty);
  }

  private toLocalSpace(pos: Point): Point | null {
    const localShift = pos.minus(this.position);
    const localPos = localShift.plus(this.localOffset);

    if (localPos.x < 0
      || localPos.y < 0
      || localPos.y > this.spriteSizePoints.height
      || localPos.x > this.spriteSizePoints.width) {
      return null;
    }
    return new Point(localPos.x, localPos.y);
  }

  public hasCollision(collisionPos: Point): boolean {
    const local = this.toLocalSpace(collisionPos);
    if (!local) {
      return false;
    }
    return this.collision[local.y][local.x] === 1;
  }
}
