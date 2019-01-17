
export class ItemModel {
  constructor(
    readonly playerItemId: number,
    readonly image: string,
    readonly amount: number,
    readonly name: string,
    readonly weight: number,
    readonly totalWeight: number
  ) {
  }

  public get imageUrl(): string {
    return `/assets/sprites/items/${this.image}`;
  }
}
