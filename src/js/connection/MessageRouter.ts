import * as PubSub from 'pubsub-js';
import * as LOG from 'loglevel';

import { Topics } from 'Topics';
import { ActionMessage } from 'message/ActionMessage';
import { ComponentMessage } from 'message/ComponentMessage';
import { ComponentDeleteMessage } from 'message';

export class MessageRouter {

  constructor() {
    PubSub.subscribe(Topics.IO_RECV_MSG, (_, msg) => this.onIncomingMessage(msg));
  }

  private onIncomingMessage(msg: any) {
    if (msg instanceof ActionMessage) {
      PubSub.publish(Topics.IO_RECV_ACTION, msg);
    } else if (msg instanceof ComponentMessage) {
      PubSub.publish(Topics.IO_RECV_COMP_MSG, msg);
    } else if (msg instanceof ComponentDeleteMessage) {
      PubSub.publish(Topics.IO_RECV_DEL_COMP_MSG, msg);
    } else {
      LOG.warn(`Unknown message arrived: ${JSON.stringify(msg)}`);
    }
  }
}
