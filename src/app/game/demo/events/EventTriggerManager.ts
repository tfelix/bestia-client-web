import * as PubSub from 'pubsub-js';
import * as LOG from 'loglevel';

import { EngineEvents } from 'app/game/message';
import { Entity } from 'app/game/entities';
import { EngineContext } from 'app/game/engine';
import { EventTrigger } from './EventTrigger';
import { HelloWorldTrigger } from './HelloWorldTrigger';

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

interface ZoneTriggered {
  zone: Phaser.GameObjects.Zone;
  playerSprite: Phaser.GameObjects.Sprite;
  eventName: string;
}

export class EventTriggerManager {

  private triggers = new Map<string, EventTrigger>();
  private activeTriggers: ZoneTriggered[] = [];

  constructor(
    private readonly ctx: EngineContext
  ) {

    this.addTrigger(new HelloWorldTrigger());

    PubSub.subscribe(EngineEvents.GAME_NEW_PLAYER_ENTITY, this.setupEventTriggers.bind(this));
  }

  private addTrigger(trigger: EventTrigger) {
    this.triggers.set(trigger.getTriggerName(), trigger);
  }

  private setupEventTriggers(_, playerEntity: Entity) {
    LOG.debug('Setup the event trigger for new player entity');

    const playerSprite = playerEntity.data.visual.sprite;

    // Enabling collision on the player sprite should not be done here. Maybe its better
    // to do this on the renderer but I am unsure where. The best would be to add this on
    // the player component renderer which needs to be created.
    this.ctx.game.physics.world.enable(playerSprite, Phaser.Physics.Arcade.DYNAMIC_BODY);

    const triggerLayer = this.ctx.data.tilemap.map.getObjectLayer('Trigger');
    triggerLayer.objects.forEach(o => {
      // Workaround as the phaser type is wrong here
      const obj = o as any as TiledObject;

      const trigger = this.triggers.get(obj.name);
      if (trigger == null) {
        LOG.debug('No trigger found for event: ' + obj.name);
        return;
      }

      const zone = this.ctx.game.add.zone(obj.x, obj.y, obj.width, obj.height);
      zone.setOrigin(0, 0);
      this.ctx.game.physics.world.enable(zone, Phaser.Physics.Arcade.STATIC_BODY);

      const eventHandler = () => {
        const triggerKey = this.getTriggerKey(obj.name);
        if (playerSprite.getData(triggerKey)) {
          return;
        }
        LOG.debug('Triggers event: ' + obj.name);

        this.activeTriggers.push({
          zone: zone,
          playerSprite: playerSprite,
          eventName: obj.name
        });

        playerSprite.setData(triggerKey, true);
        trigger.triggers();
      };

      this.ctx.game.physics.add.overlap(zone, playerSprite, eventHandler, null, this);
    });
  }

  private getTriggerKey(triggerName: string) {
    return 'trigger_' + triggerName;
  }

  /**
   * Clears zones which are not active anymore.
   */
  public update() {
    for (let i = 0; i < this.activeTriggers.length; i++) {
      const trigger = this.activeTriggers[i];

      const rect1 = new Phaser.Geom.Rectangle(
        trigger.zone.x,
        trigger.zone.y,
        trigger.zone.width,
        trigger.zone.height
      );
      const rect2 = new Phaser.Geom.Rectangle(
        trigger.playerSprite.x,
        trigger.playerSprite.y,
        trigger.playerSprite.width,
        trigger.playerSprite.height
      );

      if (!Phaser.Geom.Rectangle.Overlaps(rect1, rect2)) {
        const triggerKey = this.getTriggerKey(trigger.eventName);
        trigger.playerSprite.setData(triggerKey, false);
        this.activeTriggers.splice(i, 1);
      }
    }
  }
}
