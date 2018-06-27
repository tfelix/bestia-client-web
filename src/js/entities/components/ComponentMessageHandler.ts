import * as PubSub from 'pubsub-js';
import { EntityStore } from '../EntityStore';
import { Topics } from 'Topics';
import { ComponentMessage } from 'message/ComponentMessage';
import { Component } from './Component';
import { ComponentDeleteMessage } from 'message';

// TODO The message handling is not clean imo. This must be done better.
export class ComponentMessageHandler {
  constructor(
    private readonly entityStore: EntityStore
  ) {

    PubSub.subscribe(Topics.IO_RECV_COMP_MSG, (_, msg) => this.onComponentMessage(msg));
    PubSub.subscribe(Topics.IO_RECV_DEL_COMP_MSG, (_, msg) => this.onComponentDeleteMessage(msg));
  }

  private onComponentMessage(msg: ComponentMessage<Component>) {
    this.entityStore.addComponent(msg.component);
  }

  private onComponentDeleteMessage(msg: ComponentDeleteMessage) {
    const entity = this.entityStore.getEntity(msg.entityId);
    const comp = entity.getComponent(msg.componentType);
    this.entityStore.removeComponent(comp);
  }
}
