import * as PubSub from 'pubsub-js';
import * as LOG from 'loglevel';

import { WeatherData } from 'app/game/engine';
import { WeatherMessage, EngineEvents, ComponentMessage } from 'app/game/message';

import { ClientMessageHandler } from './ClientMessageHandler';
import { ItemPickupHandler } from './ItemPickupHandler';
import { BasicAttackHandler } from './BasicAttackHandler';
import { RequestSyncHandler } from './RequestSyncHandler';
import { AbortPerformHandler } from './AbortPerformHandler';
import { InteractionHandler } from './InteractionHandler';
import { ServerEntityStore } from './ServerEntityStore';
import { EntityLocalFactory } from './EntityLocalFactory';
import { MoveComponentHandler } from './MoveComponentHandler';
import { EventTriggerManager } from './events/EventTriggerManager';
import { FishingComponentHandler } from './FishingComponentHandler';
import { Simulator } from './simulator/Simulator';
import { WeatherSimulator } from './simulator/WeatherSimulator';
import { MoveComponent } from '../entities';

const PLAYER_ACC_ID = 1337;
const PLAYER_ENTITY_ID = 1;

export class ServerEmulator {

  private tickrateHz = 60;
  private serverEntities = new ServerEntityStore();
  private entityFactory = new EntityLocalFactory(this.serverEntities);
  private messageHandler: Array<ClientMessageHandler<any>> = [];
  private simulators: Array<Simulator> = [];
  private eventManager: EventTriggerManager;

  constructor(
    private readonly game: Phaser.Game
  ) {
    PubSub.subscribe(EngineEvents.IO_SEND_MSG, (_, msg: any) => this.receivedFromClient(msg));
    PubSub.subscribe(EngineEvents.IO_RECV_MSG, (_, msg: any) => this.interceptToClient(msg));


    this.eventManager = new EventTriggerManager(this.game);

    this.messageHandler.push(new ItemPickupHandler(this.serverEntities, PLAYER_ENTITY_ID));
    this.messageHandler.push(new BasicAttackHandler(this.serverEntities, this.entityFactory));
    this.messageHandler.push(new RequestSyncHandler(this.serverEntities, PLAYER_ACC_ID, this.entityFactory));
    this.messageHandler.push(new AbortPerformHandler(this.serverEntities, PLAYER_ENTITY_ID));
    this.messageHandler.push(new InteractionHandler(this.serverEntities));
    this.messageHandler.push(new MoveComponentHandler(this.serverEntities));
    this.messageHandler.push(new FishingComponentHandler(this.serverEntities, PLAYER_ENTITY_ID));

    this.simulators.push(new WeatherSimulator());
  }

  public start() {
    LOG.debug('Server emulator started');

    this.simulators.forEach(s => s.start());

    window.setInterval(this.update.bind(this), 1000 / this.tickrateHz);
  }

  private update() {
    this.eventManager.update();

    this.simulators.forEach(s => s.update());
  }

  /**
   * Certain messages need special handling if send to the client. This filtering
   * and handling is done here.
   */
  private interceptToClient(message: any) {
    if (message instanceof ComponentMessage) {
      if (message.component instanceof MoveComponent) {
        this.tryHandleMessage(message);
      }
    }
  }

  private tryHandleMessage(message: any): boolean {
    let wasHandled = false;
    this.messageHandler.forEach(h => {
      if (h.isHandlingMessage(message)) {
        h.handle(message);
        wasHandled = true;
      }
    });

    return wasHandled;
  }

  private receivedFromClient(message: any) {
    if (!this.tryHandleMessage(message)) {
      const msgCtorName = message.constructor.name;
      LOG.warn(`Unknown client message received: ${msgCtorName}:${JSON.stringify(message)}`);
    }
  }
}
