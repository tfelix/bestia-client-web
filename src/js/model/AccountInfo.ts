import { AccountInfoMessage } from 'message';
import { Topics } from 'connection';

export class AccountInfo {

  public username: string;
  public accountId: number;
  public masterName: string;

  constructor() {
    PubSub.subscribe(Topics.IO_RECV_ACC_INFO_MSG, (_, msg) => this.handleAccountInfo(msg));
  }

  private handleAccountInfo(msg: AccountInfoMessage) {
    this.username = msg.username;
    this.masterName = msg.masterName;
    this.accountId = msg.accountId;
  }
}
