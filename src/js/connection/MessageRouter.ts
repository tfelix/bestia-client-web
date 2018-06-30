import * as PubSub from 'pubsub-js';
import * as LOG from 'loglevel';

import { Topics } from 'Topics';

export interface Route {
  handles(msg: any): boolean;
  routeTopic: string;
}

export class MessageRouter {

  private routes: Route[] = [];

  constructor(
    routes: Route[]
  ) {
    PubSub.subscribe(Topics.IO_RECV_MSG, (_, msg) => this.onIncomingMessage(msg));

    this.routes.push(...routes);
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
