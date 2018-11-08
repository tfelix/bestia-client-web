import * as PubSub from 'pubsub-js';
import * as LOG from 'loglevel';
import { EngineEvents } from '../message';

export interface Route {
  routeTopic: string;
  handles(msg: any): boolean;
}

export class MessageRouter {

  private routes: Route[] = [];

  constructor(
    routes: Route[]
  ) {
    PubSub.subscribe(EngineEvents.IO_RECV_MSG, (_, msg) => this.onIncomingMessage(msg));

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
      LOG.warn(`Unroutable message arrived: ${JSON.stringify(msg)}\nDid you forget to wrap it into a ComponentMessage envelope?`);
    }
  }
}
