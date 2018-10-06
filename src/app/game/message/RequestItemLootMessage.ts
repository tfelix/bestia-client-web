export class RequestItemLootMessage {
  constructor(
    public readonly itemEntityId: number,
    public readonly amount: number
  ) {
  }
}
