import * as PubSub from 'pubsub-js';
import * as LOG from 'loglevel';
import { Topics } from 'Topics';
import { BasicAttackMessage } from 'message/BasicAttackMessage';
import { EntityStore, KillAction, DamageAction, Entity } from 'entities';
import { ActionMessage } from 'message/ActionMessage';
import { ComponentType, Component, VisualComponent, MoveComponent } from 'entities/components';
import { ConditionComponent } from 'entities/components/ConditionComponent';
import { ComponentMessage } from 'message/ComponentMessage';
import { ComponentDeleteMessage } from 'message/ComponentDeleteMessage';
import { SyncRequestMessage, AbortPerformMessage, AccountInfoMessage } from 'message';
import { PerformComponent } from 'entities/components/PerformComponent';
import { Point } from 'model';
import { ClientMessageHandler, ItemPickupHandler } from 'demo';
import { EntityLocalFactory } from './EntityLocalFactory';
import { ConditionHelper } from './ConditionHelper';
import { ComponentCopyHelper } from './ComponentCopyHelper';

const PLAYER_ACC_ID = 1337;

export class ServerLocalFacade {

  private readonly PLAYER_ENTITY_ID = 1;

  private condHelper = new ConditionHelper(this.clientEntities);
  private copyHelper = new ComponentCopyHelper(this.clientEntities);

  private serverEntities = new EntityStore();
  private entityFactory = new EntityLocalFactory(this.serverEntities);

  private messageHandler: Array<ClientMessageHandler<any>> = [];

  constructor(
    private readonly clientEntities: EntityStore
  ) {
    PubSub.subscribe(Topics.IO_SEND_MSG, (_, msg: any) => this.receivedFromClient(msg));

    this.messageHandler.push(new ItemPickupHandler(this.serverEntities));
  }

  private receivedFromClient(message: any) {
    this.messageHandler.forEach(h => {
      if (h.isHandlingMessage(message)) {
        h.handle(message);
      }
    });

    if (message instanceof BasicAttackMessage) {
      this.handleBasicAttack(message);
    } else if (message instanceof SyncRequestMessage) {
      this.syncClient();
    } else if (message instanceof AbortPerformMessage) {
      const deleteMessage = new ComponentDeleteMessage(this.PLAYER_ENTITY_ID, ComponentType.PERFORM);
      this.sendClient(deleteMessage);
    } else {
      LOG.warn(`Unknown client message received: ${JSON.stringify(message)}`);
    }
  }

  private syncClient() {
    const accInfoMsg = new AccountInfoMessage('roggy', PLAYER_ACC_ID, 'master');
    this.sendClient(accInfoMsg);

    const comps = this.entityFactory.addPlayer('player_1', new Point(2, 3), PLAYER_ACC_ID);
    this.sendAllComponents(comps);

    // TODO Handle AI differently
    const bestiaComps = this.entityFactory.addBestia('rabbit', new Point(5, 6));
    const entityId = bestiaComps[0].entityId;
    window.setTimeout(() => {
      const moveComp = new MoveComponent(23456, entityId);
      moveComp.path = [
        new Point(4, 7),
        new Point(4, 8),
        new Point(4, 9),
        new Point(3, 9),
        new Point(2, 9),
        new Point(3, 8),
        new Point(4, 7)
      ];
      this.sendClient(new ComponentMessage<MoveComponent>(moveComp));
    }, 2000);
    this.sendAllComponents(bestiaComps);
    this.sendAllComponents(this.entityFactory.addBestia('rabbit', new Point(12, 12)));

    this.sendAllComponents(this.entityFactory.addObject('tree', new Point(10, 10)));
    this.sendAllComponents(this.entityFactory.addObject('tree', new Point(14, 12)));
    this.sendAllComponents(this.entityFactory.addObject('tree', new Point(18, 9)));
    this.sendAllComponents(this.entityFactory.addObject('tree', new Point(6, 16)));

    this.sendAllComponents(this.entityFactory.addObject('plant', new Point(3, 4)));
    this.sendAllComponents(this.entityFactory.addObject('plant', new Point(10, 8)));
    this.sendAllComponents(this.entityFactory.addObject('plant', new Point(7, 8)));

    this.sendAllComponents(this.entityFactory.addObject('water', new Point(5, 8)));

    this.sendAllComponents(this.entityFactory.addObject('sign', new Point(2, 8)));

    this.sendAllComponents(this.entityFactory.addItem('empty_bottle', 2, new Point(3, 12)));
    this.sendAllComponents(this.entityFactory.addItem('empty_bottle', 1, new Point(7, 18)));

    this.sendAllComponents(this.entityFactory.addItem('knife', 1, new Point(12, 10)));
    this.sendAllComponents(this.entityFactory.addItem('knife', 1, new Point(3, 6)));
  }

  private sendAllComponents(components: Component[]) {
    components.forEach((c) => {
      const compMsg = new ComponentMessage(c);
      this.sendClient(compMsg);
    });
  }

  private handlePerform() {
    const perfComp = new PerformComponent(
      71235,
      this.PLAYER_ENTITY_ID
    );
    perfComp.duration = 10000;
    perfComp.skillname = 'chop_tree';
    const playerEntity = this.serverEntities.getEntity(this.PLAYER_ENTITY_ID);
    playerEntity.addComponent(perfComp);
    const compMsg = new ComponentMessage<PerformComponent>(perfComp);
    this.sendClient(compMsg);

    window.setTimeout(() => {
      const deleteMessage = new ComponentDeleteMessage(1, ComponentType.PERFORM);
      this.sendClient(deleteMessage);
    },
      10000
    );
  }

  private handleBasicAttack(msg: BasicAttackMessage) {
    const dmg = Math.round(Math.random() * 15 + 5);

    const currentHp = this.condHelper.getCurrentHp(msg.targetEntityId);
    const newHp = currentHp - dmg;

    const dmgAction = new DamageAction(dmg);
    const actionMsg = new ActionMessage<DamageAction>(msg.targetEntityId, dmgAction);
    this.sendClient(actionMsg);

    if (newHp <= 0) {
      const killAction = new KillAction();
      const killActionMsg = new ActionMessage<KillAction>(msg.targetEntityId, killAction);
      this.sendClient(killActionMsg);
      this.killEntity(msg.targetEntityId);
    }

    const condComp = this.copyHelper.copyComponent(msg.targetEntityId, ComponentType.CONDITION) as ConditionComponent;
    condComp.currentHealth = newHp;
    const compMsg = new ComponentMessage<ConditionComponent>(condComp);
    this.sendClient(compMsg);
  }

  private killEntity(entityId: number) {
    const entity = this.serverEntities.getEntity(entityId);
    if (!entity) {
      return;
    }

    const visualComp = this.copyHelper.copyComponent(entityId, ComponentType.VISUAL) as VisualComponent;
    visualComp.animation = 'die';
    const compMsg = new ComponentMessage<VisualComponent>(visualComp);
    this.sendClient(compMsg);

    const deleteComponentIds = [];
    deleteComponentIds.forEach(id => {
      const deleteMessage = new ComponentDeleteMessage(entityId, id);
      this.sendClient(deleteMessage);
    });
  }

  private sendClient(msg: any) {
    PubSub.publish(Topics.IO_RECV_MSG, msg);
  }
}
