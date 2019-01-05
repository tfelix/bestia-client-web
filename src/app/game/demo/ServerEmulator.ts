import * as PubSub from 'pubsub-js';
import * as LOG from 'loglevel';

import { WeatherData } from 'app/game/engine';
import { WeatherMessage, EngineEvents } from 'app/game/message';

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

const PLAYER_ACC_ID = 1337;
const PLAYER_ENTITY_ID = 1;

export class ServerEmulator {

  private tickrateHz = 60;
  private serverEntities = new ServerEntityStore();
  private entityFactory = new EntityLocalFactory(this.serverEntities);
  private messageHandler: Array<ClientMessageHandler<any>> = [];
  private eventManager: EventTriggerManager;

  constructor(
    private readonly game: Phaser.Game
  ) {
    PubSub.subscribe(EngineEvents.IO_SEND_MSG, (_, msg: any) => this.receivedFromClient(msg));

    this.eventManager = new EventTriggerManager(this.game);

    this.messageHandler.push(new ItemPickupHandler(this.serverEntities, PLAYER_ENTITY_ID));
    this.messageHandler.push(new BasicAttackHandler(this.serverEntities, this.entityFactory));
    this.messageHandler.push(new RequestSyncHandler(this.serverEntities, PLAYER_ACC_ID, this.entityFactory));
    this.messageHandler.push(new AbortPerformHandler(this.serverEntities, PLAYER_ENTITY_ID));
    this.messageHandler.push(new InteractionHandler(this.serverEntities));
    this.messageHandler.push(new MoveComponentHandler(this.serverEntities));
    this.messageHandler.push(new FishingComponentHandler(this.serverEntities, PLAYER_ENTITY_ID));
  }

  private sendClient(msg: any) {
    PubSub.publish(EngineEvents.IO_RECV_MSG, msg);
  }

  public start() {
    LOG.debug('Server emulator started');
    const date = new Date();
    const isRaining = false; // date.getDay() % 2 === 0;
    let dayBrightness = Math.abs(Math.abs(date.getHours() / 24 - 0.5) * 2 - 1);
    if (dayBrightness < 0.6) {
      dayBrightness = 0.6;
    }

    const weatherData: WeatherData = {
      rainIntensity: 0,
      sunBrigthness: dayBrightness,
      lightningIntensity: 0,
      thunderIntensity: 0,
      thunderDistanceM: 0,
    };

    if (isRaining) {
      weatherData.rainIntensity = Math.random() * 2;
      weatherData.lightningIntensity = Math.random() * 1;
      weatherData.thunderIntensity = 0.5;
      weatherData.thunderDistanceM = Math.random() * 1200;
    }

    const weatherMessage = new WeatherMessage(weatherData);
    this.sendClient(weatherMessage);

    window.setInterval(this.update.bind(this), 1000 / this.tickrateHz);
  }

  private update() {
    this.eventManager.update();
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
      const msgCtorName = message.constructor.name;
      LOG.warn(`Unknown client message received: ${msgCtorName}:${JSON.stringify(message)}`);
    }
  }
}
