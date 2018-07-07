import * as PubSub from 'pubsub-js';
import * as LOG from 'loglevel';
import { Topics } from 'Topics';
import { ClientMessageHandler, ItemPickupHandler } from 'demo';
import { BasicAttackHandler } from './BasicAttackHandler';
import { EntityStore } from 'entities';
import { RequestSyncHandler } from './RequestSyncHandler';
import { AbortPerformHandler } from './AbortPerformHandler';

const PLAYER_ACC_ID = 1337;
const PLAYER_ENTITY_ID = 1;

export class ServerLocalFacade {

  private serverEntities = new EntityStore();
  private messageHandler: Array<ClientMessageHandler<any>> = [];

  constructor(
    private readonly clientEntities: EntityStore
  ) {
    PubSub.subscribe(Topics.IO_SEND_MSG, (_, msg: any) => this.receivedFromClient(msg));

    this.messageHandler.push(new ItemPickupHandler(this.serverEntities, PLAYER_ENTITY_ID));
    this.messageHandler.push(new BasicAttackHandler(this.clientEntities, this.serverEntities));
    this.messageHandler.push(new RequestSyncHandler(this.serverEntities, PLAYER_ACC_ID, PLAYER_ENTITY_ID));
    this.messageHandler.push(new AbortPerformHandler(this.serverEntities, PLAYER_ENTITY_ID));
  }

  private receivedFromClient(message: any) {
    let wasHandled = false;
    this.messageHandler.forEach(h => {
      if (h.isHandlingMessage(message)) {
        h.handle(message);
        wasHandled = true;
      }
    });
    if (!wasHandled) {
      LOG.warn(`Unknown client message received: ${JSON.stringify(message)}`);
    }
  }
}
