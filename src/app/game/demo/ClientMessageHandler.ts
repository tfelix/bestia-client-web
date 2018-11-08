import * as LOG from 'loglevel';

import { Entity } from 'entities';
import { ComponentDeleteMessage, ComponentMessage, EngineEvents } from 'app/game/message';
import { Component } from 'app/game/entities';

export abstract class ClientMessageHandler<T> {
  public abstract isHandlingMessage(msg: any): boolean;

  public abstract handle(msg: T);

  protected deleteEntity(entity: Entity) {
    LOG.debug(`Deleting entity: ${entity.id}`);
    const componentsToDelete = [];
    for (const c of entity.getComponentIterator()) {
      componentsToDelete.push(c.type);
    }
    componentsToDelete.forEach(ct => {
      const compDelMsg = new ComponentDeleteMessage(entity.id, ct);
      this.sendClient(compDelMsg);
      entity.removeComponentByType(ct);
    });
  }

  protected sendClient(msg: any) {
    PubSub.publish(EngineEvents.IO_RECV_MSG, msg);
  }

  protected sendAllComponents(components: Component[]) {
    components.forEach((c) => {
      const compMsg = new ComponentMessage(c);
      this.sendClient(compMsg);
    });
  }

  protected sendComponent(component: Component) {
    const compMsg = new ComponentMessage(component);
    this.sendClient(compMsg);
  }
}
