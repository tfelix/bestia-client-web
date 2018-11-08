import * as PubSub from 'pubsub-js';
import * as LOG from 'loglevel';

import { WeatherData, EngineContext } from 'app/game/engine';
import { WeatherMessage, EngineEvents, UiModalMessage } from 'app/game/message';
import { EntityStore, Entity, ComponentType, VisualComponent } from 'app/game/entities';

import { ClientMessageHandler } from './ClientMessageHandler';
import { ItemPickupHandler } from './ItemPickupHandler';
import { BasicAttackHandler } from './BasicAttackHandler';
import { RequestSyncHandler } from './RequestSyncHandler';
import { AbortPerformHandler } from './AbortPerformHandler';
import { InteractionHandler } from './InteractionHandler';
import { ServerEntityStore } from './ServerEntityStore';
import { EntityLocalFactory } from './EntityLocalFactory';
import { MoveComponentHandler } from './MoveComponentHandler';

const PLAYER_ACC_ID = 1337;
const PLAYER_ENTITY_ID = 1;

interface TiledObject {
  height: number;
  name: string;
  properties: { [s: string]: string; };
  rectangle: boolean;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
}

export class ServerEmulator {

  private serverEntities = new ServerEntityStore();
  private entityFactory = new EntityLocalFactory(this.serverEntities);
  private messageHandler: Array<ClientMessageHandler<any>> = [];

  constructor(
    private readonly clientEntities: EntityStore,
    private readonly ctx: EngineContext
  ) {
    PubSub.subscribe(EngineEvents.IO_SEND_MSG, (_, msg: any) => this.receivedFromClient(msg));

    this.messageHandler.push(new ItemPickupHandler(this.serverEntities, PLAYER_ENTITY_ID));
    this.messageHandler.push(new BasicAttackHandler(this.clientEntities, this.serverEntities, this.entityFactory));
    this.messageHandler.push(new RequestSyncHandler(this.serverEntities, PLAYER_ACC_ID, PLAYER_ENTITY_ID, this.entityFactory));
    this.messageHandler.push(new AbortPerformHandler(this.serverEntities, PLAYER_ENTITY_ID));
    this.messageHandler.push(new InteractionHandler(this.serverEntities));
    this.messageHandler.push(new MoveComponentHandler(this.serverEntities));
  }

  private sendClient(msg: any) {
    PubSub.publish(EngineEvents.IO_RECV_MSG, msg);
  }

  public create() {
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

    PubSub.subscribe(EngineEvents.GAME_NEW_PLAYER_ENTITY, this.setupEventTriggers.bind(this));
  }

  // TODO Put this into an own manager: EventEmulatorManager.ts
  private setupEventTriggers(_, playerEntity: Entity) {
    LOG.debug('Setup the event trigger for new player entity');

    const sprite = playerEntity.data.visual.sprite;

    // Enabling collision on the player sprite should not be done here. Maybe its better
    // to do this on the renderer but I am unsure where. The best would be to add this on
    // the player component renderer which needs to be created.
    this.ctx.game.physics.world.enable(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY);

    const triggerLayer = this.ctx.data.tilemap.map.getObjectLayer('Trigger');
    triggerLayer.objects.forEach(o => {
      // Workaround as the phaser type is wrong here
      const obj = o as any as TiledObject;

      const zone = this.ctx.game.add.zone(obj.x, obj.y, obj.width, obj.height);
      zone.setOrigin(0, 0);
      this.ctx.game.physics.world.enable(zone, Phaser.Physics.Arcade.STATIC_BODY);
      const zoneBody = zone.body as Phaser.Physics.Arcade.Body;
      zoneBody.moves = false;

      this.ctx.game.physics.add.overlap(zone, sprite, this.triggerEvent, null, this);
    });
  }

  private triggerEvent(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
    // TODO This is a test and needs proper event handling
    const msg = new UiModalMessage(0, 'Hello Darkness my old friend');
    PubSub.publish(EngineEvents.IO_RECV_MSG, msg);
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
