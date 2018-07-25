import * as PubSub from 'pubsub-js';
import * as LOG from 'loglevel';

import { WeatherData } from 'engine';
import { Topics } from 'connection';
import { WeatherMessage } from 'message/WeatherDataMessage';
import { EntityStore } from 'entities';

import { ClientMessageHandler, ItemPickupHandler } from '.';
import { BasicAttackHandler } from './BasicAttackHandler';
import { RequestSyncHandler } from './RequestSyncHandler';
import { AbortPerformHandler } from './AbortPerformHandler';
import { InteractionHandler } from './InteractionHandler';
import { ServerEntityStore } from './ServerEntityStore';

const PLAYER_ACC_ID = 1337;
const PLAYER_ENTITY_ID = 1;

export class ServerEmulator {

  private serverEntities = new ServerEntityStore();
  private messageHandler: Array<ClientMessageHandler<any>> = [];

  constructor(
    private readonly clientEntities: EntityStore
  ) {
    PubSub.subscribe(Topics.IO_SEND_MSG, (_, msg: any) => this.receivedFromClient(msg));

    this.messageHandler.push(new ItemPickupHandler(this.serverEntities, PLAYER_ENTITY_ID));
    this.messageHandler.push(new BasicAttackHandler(this.clientEntities, this.serverEntities));
    this.messageHandler.push(new RequestSyncHandler(this.serverEntities, PLAYER_ACC_ID, PLAYER_ENTITY_ID));
    this.messageHandler.push(new AbortPerformHandler(this.serverEntities, PLAYER_ENTITY_ID));
    this.messageHandler.push(new InteractionHandler(this.serverEntities));
  }

  private sendClient(msg: any) {
    PubSub.publish(Topics.IO_RECV_MSG, msg);
  }

  public create() {
    const date = new Date();
    const isRaining = date.getDay() % 2 === 0;
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
  }

  public update() {

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
