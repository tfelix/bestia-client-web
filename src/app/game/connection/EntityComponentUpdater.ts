import * as LOG from 'loglevel';

import { EntityStore } from 'app/game/entities';
import { ComponentMessage, ComponentDeleteMessage } from 'app/game/message';
import { Component } from 'app/game/entities';
import { Topics } from '.';

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
      entity.addComponent(msg.component);
    }
  }

  private onComponentDeleteMessage(msg: ComponentDeleteMessage) {
    LOG.debug(`Delete component: ${msg.componentType} from entity: ${msg.entityId}`);
    const entity = this.entityStore.getEntity(msg.entityId);
    if (entity) {
      entity.removeComponentByType(msg.componentType);
    }
  }
}
