import * as PubSub from 'pubsub-js';
import * as LOG from 'loglevel';

import { EngineEvents } from 'app/game/message';
import { Entity } from 'app/game/entities';
import { SceneNames, GameScene } from 'app/game/engine';
import { EventTrigger } from './EventTrigger';
import { HelloWorldTrigger } from './HelloWorldTrigger';
import { Trigger01BlockHouseLeave } from './ScriptedTriggers';

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

interface ZoneTrigger {
  triggerZone: Phaser.Geom.Rectangle;
  handler: EventTrigger;
  eventName: string;
}

export class EventTriggerManager {
  private preparedTriggerHandler = new Map<string, EventTrigger>();

  private triggerZones: ZoneTrigger[] = [];
  private gameScene: GameScene;

  private playerSprite: Phaser.GameObjects.Sprite = null;
  private playerCollisionRect: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(0, 0, 32, 32);

  constructor(
    private readonly game: Phaser.Game
  ) {
    this.gameScene = this.game.scene.getScene(SceneNames.GAME) as GameScene;

    this.addTrigger(new HelloWorldTrigger());
    this.addTrigger(new Trigger01BlockHouseLeave());

    PubSub.subscribe(EngineEvents.GAME_NEW_PLAYER_ENTITY, this.setupPlayerEntity.bind(this));

    this.setupEventTriggers();
  }

  private addTrigger(trigger: EventTrigger) {
    this.preparedTriggerHandler.set(trigger.getTriggerName(), trigger);
  }

  private setupPlayerEntity(_, playerEntity: Entity) {
    this.playerSprite = playerEntity.data.visual.sprite;
  }

  private setupEventTriggers() {
    const triggerLayer = this.gameScene.engineContext.data.tilemap.map.getObjectLayer('Trigger');
    triggerLayer.objects.forEach(o => {
      LOG.debug('Setup the event trigger ' + o.name);
      // Workaround as the phaser type is wrong here
      const obj = o as any as TiledObject;

      const trigger = this.preparedTriggerHandler.get(obj.name);
      if (trigger == null) {
        LOG.debug('No trigger found for event: ' + obj.name);
        return;
      }

      this.triggerZones.push({
        eventName: obj.name,
        triggerZone: new Phaser.Geom.Rectangle(
          obj.x + 15,
          obj.y + 15,
          obj.width - 30,
          obj.height - 30
        ),
        handler: trigger
      });
    });
  }

  private getTriggerKey(triggerName: string) {
    return 'trigger_' + triggerName;
  }

  /**
   * Clears zones which are not active anymore.
   */
  public update() {
    this.playerCollisionRect.x = this.playerSprite.x;
    this.playerCollisionRect.y = this.playerSprite.y;

    for (let i = 0; i < this.triggerZones.length; i++) {
      const trigger = this.triggerZones[i];
      const triggerKey = this.getTriggerKey(trigger.eventName);

      if (Phaser.Geom.Rectangle.Overlaps(this.playerCollisionRect, trigger.triggerZone)) {
        if (this.playerSprite.getData(triggerKey)) {
          continue;
        }
        this.playerSprite.setData(triggerKey, true);
        this.handleCollisionTrigger(trigger);
      } else {
        this.playerSprite.setData(triggerKey, false);
      }
    }
  }

  private handleCollisionTrigger(trigger: ZoneTrigger) {
    LOG.debug('Triggers event: ' + trigger.eventName);
    trigger.handler.triggers();
  }
}
