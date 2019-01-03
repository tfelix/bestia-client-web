export class Px {
  constructor(
    public readonly x: number,
    public readonly y: number
  ) {
  }

  public getDistance(p: Px): number {
    const dx = p.x - this.x;
    const dy = p.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public getDistanceXY(x: number, y: number): number {
    const dx = x - this.x;
    const dy = y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
