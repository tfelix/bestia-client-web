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

    const offsetX = Math.floor(width * spriteDescription.anchor.x);
    const offsetY = Math.floor(height * spriteDescription.anchor.y);
    this.localOffset = new Point(offsetX, offsetY);
  }

  public nextNonCollision(localEntry: Point, direction: Point): Point {
    return new Point(0, 0);
  }

  public hasCollision(collisionPos: Point): boolean {
    const localPos = collisionPos.minus(this.position);
    const originPos = localPos.plus(this.localOffset);

    if (originPos.x <= 0
      || originPos.y <= 0
      || originPos.y > this.spriteSizePoints.height
      || originPos.x > this.spriteSizePoints.width) {
      return false;
    }

    return this.collision[originPos.y - 1][originPos.x - 1] === 1;
  }
}
