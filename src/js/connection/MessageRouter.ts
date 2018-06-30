import * as PubSub from 'pubsub-js';
import * as LOG from 'loglevel';

import { Topics } from 'Topics';
import { ActionMessage } from 'message/ActionMessage';
import { ComponentMessage } from 'message/ComponentMessage';
import { ComponentDeleteMessage } from 'message';

interface Route {
  handles(msg: any): boolean;
  routeTopic: string;
}

export class MessageRouter {

  private routes: Route[] = [];

  constructor() {
    PubSub.subscribe(Topics.IO_RECV_MSG, (_, msg) => this.onIncomingMessage(msg));

    this.addRoute({ handles: (msg) => msg instanceof ActionMessage, routeTopic: Topics.IO_RECV_ACTION});
    this.addRoute({ handles: (msg) => msg instanceof ComponentMessage, routeTopic: Topics.IO_RECV_COMP_MSG});
    this.addRoute({ handles: (msg) => msg instanceof ComponentDeleteMessage, routeTopic: Topics.IO_RECV_DEL_COMP_MSG});
  }

  public addRoute(route: Route) {
    this.routes.push(route);
  }

  private onIncomingMessage(msg: any) {
    let wasHandled = false;
    this.routes.forEach(r => {
      if (r.handles(msg)) {
        PubSub.publish(r.routeTopic, msg);
        wasHandled = true;
      }
    });

    if (!wasHandled) {
      LOG.warn(`Unroutable message arrived: ${JSON.stringify(msg)}`);
    }
  }
}
