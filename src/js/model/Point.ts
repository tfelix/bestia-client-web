export class Point {
  constructor(
    public readonly x: number,
    public readonly y: number
  ) {
  }

  public getDistance(p: Point): number {
    const dx = p.x - this.x;
    const dy = p.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public minus(rhs: Point): Point {
    return new Point(this.x - rhs.x, this.y - rhs.y);
  }

  public plus(rhs: Point): Point {
    return new Point(this.x + rhs.x, this.y + rhs.y);
  }
}
