import { EntityStore } from 'entities';
import { Topics } from 'Topics';
import { ComponentMessage, ComponentDeleteMessage } from 'message';
import { Component } from 'entities/components';

export class EntityComponentUpdater {
  constructor(
    private readonly entityStore: EntityStore
  ) {

    PubSub.subscribe(Topics.IO_RECV_COMP_MSG, (_, msg) => this.onComponentMessage(msg));
    PubSub.subscribe(Topics.IO_RECV_DEL_COMP_MSG, (_, msg) => this.onComponentDeleteMessage(msg));
  }

  private onComponentMessage(msg: ComponentMessage<Component>) {
    const entity = this.entityStore.getEntity(msg.component.entityId);
    if (entity) {
      // entity.removeComponentByType(msg.component.type);
      entity.addComponent(msg.component);
    }
  }

  private onComponentDeleteMessage(msg: ComponentDeleteMessage) {
    const entity = this.entityStore.getEntity(msg.entityId);
    if (entity) {
      entity.removeComponentByType(msg.componentType);
    }
  }
}
