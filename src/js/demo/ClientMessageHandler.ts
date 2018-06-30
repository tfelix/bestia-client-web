import * as LOG from 'loglevel';

import { Entity } from 'entities';
import { ComponentDeleteMessage } from 'message';
import { Topics } from 'Topics';

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
    PubSub.publish(Topics.IO_RECV_MSG, msg);
  }
}
