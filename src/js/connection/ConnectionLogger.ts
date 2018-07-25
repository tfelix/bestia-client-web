import * as PubSub from 'pubsub-js';
import * as LOG from 'loglevel';

import { Topics } from '.';

export class ConnectionLogger {

  constructor() {

    PubSub.subscribe(Topics.IO_SEND_MSG, this.printSendMsg);
    PubSub.subscribe(Topics.IO_RECV_MSG, this.printReceiveMsg);
  }

  private printSendMsg(_, msg: any) {
    LOG.debug(`Tx: ${JSON.stringify(msg)}`);
  }

  private printReceiveMsg(_, msg: any) {
    LOG.debug(`Rx: ${JSON.stringify(msg)}`);
  }
}
