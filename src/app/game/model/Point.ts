export interface Vec2 {
  x: number;
  y: number;
}

export class Point implements Vec2 {
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

  public abs(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public scalarp(rhs: Point): number {
    return this.x * rhs.x + this.y * rhs.y;
  }

  public norm(): Point {
    const abs = this.abs();
    return new Point(this.x / abs, this.y / abs);
  }
}
