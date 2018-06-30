
export class AccountInfoMessage {
  constructor(
    public readonly username: string,
    public readonly accountId: number,
    public readonly masterName: string
  ) {
  }
}
