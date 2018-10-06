import * as PubSub from 'pubsub-js';
import * as LOG from 'loglevel';

import { ActionMessage } from 'app/game/message';
import { EntityStore } from 'app/game/entities';
import { Topics } from 'app/game/connection';

export class ActionMessageHandler {
  constructor(
    private readonly entityStore: EntityStore
  ) {

    PubSub.subscribe(Topics.IO_RECV_ACTION, (_, msg) => this.onActionMessage(msg));
  }

  private onActionMessage(msg: ActionMessage<any>) {
    const entity = this.entityStore.getEntity(msg.entityId);
    if (!entity) {
      return LOG.warn(`ActionMsgHandler: Entity ${entity.id} not found.`);
    }
    entity.actions.push(msg.payload);
  }
}
