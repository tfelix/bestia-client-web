export class ItemPickupMessage {
  constructor(
    public readonly itemEntityId: number,
    public readonly amount: number
  ) {
  }
}
