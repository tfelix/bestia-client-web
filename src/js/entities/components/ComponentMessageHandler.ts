import * as PubSub from 'pubsub-js';
import { EntityStore } from '../EntityStore';
import { Topics } from 'Topics';
import { ComponentMessage } from 'message/ComponentMessage';
import { Component } from './Component';

export class ComponentMessageHandler {
  constructor(
    private readonly entityStore: EntityStore
  ) {

    PubSub.subscribe(Topics.IO_RECV_COMP_MSG, (_, msg) => this.onComponentMessage(msg));
  }

  private onComponentMessage(msg: ComponentMessage<Component>) {
    this.entityStore.addComponent(msg.component);
  }
}
