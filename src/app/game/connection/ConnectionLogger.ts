import * as PubSub from 'pubsub-js';
import * as LOG from 'loglevel';
import { EngineEvents } from '../message';

export class ConnectionLogger {

  constructor() {

    PubSub.subscribe(EngineEvents.IO_SEND_MSG, this.printSendMsg);
    PubSub.subscribe(EngineEvents.IO_RECV_MSG, this.printReceiveMsg);
  }

  private printSendMsg(_, msg: any) {
    LOG.debug(`Tx: ${JSON.stringify(msg)}`);
  }

  private printReceiveMsg(_, msg: any) {
    LOG.debug(`Rx: ${JSON.stringify(msg)}`);
  }
}
