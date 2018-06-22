import * as PubSub from 'pubsub-js';
import * as LOG from 'loglevel';

import { Topics } from 'Topics';
import { ActionMessage } from 'message/ActionMessage';

export class MessageRouter {

  constructor() {
    PubSub.subscribe(Topics.IO_RECV_MSG, (_, msg) => this.onIncomingMessage(msg));
  }

  private onIncomingMessage(msg: any) {
    if (msg instanceof ActionMessage) {
      PubSub.publish(Topics.IO_RECV_ACTION, msg);
    } else {
      LOG.warn(`Unknown message arrived: ${JSON.stringify(msg)}`);
    }
  }
}
