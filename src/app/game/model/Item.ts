export class Item {

  constructor(
    public readonly itemId: number,
    public readonly playerItemId: number,
    public readonly name: string,
    public amount: number,
  ) {
  }
}
