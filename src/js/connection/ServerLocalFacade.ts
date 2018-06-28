import * as PubSub from 'pubsub-js';
import * as LOG from 'loglevel';
import { Topics } from 'Topics';
import { BasicAttackMessage } from 'message/BasicAttackMessage';
import { EntityStore, KillAction, DamageAction } from 'entities';
import { Message } from 'message/Message';
import { ActionMessage } from 'message/ActionMessage';
import { ComponentType, Component, VisualComponent } from 'entities/components';
import { ConditionComponent } from 'entities/components/ConditionComponent';
import { ComponentMessage } from 'message/ComponentMessage';
import { ComponentDeleteMessage } from 'message/ComponentDeleteMessage';
import { SyncRequestMessage, AbortPerformMessage } from 'message';
import { PerformComponent } from 'entities/components/PerformComponent';

const serverEntities = new EntityStore();

// Helper Classes
class ConditionHelper {

  constructor(
    private readonly entityStore: EntityStore
  ) {
  }

  public getCurrentHp(entityId: number): number {
    const entity = this.entityStore.getEntity(entityId);
    if (!entity) {
      return 0;
    }
    const condComp = entity.getComponent(ComponentType.CONDITION) as ConditionComponent;
    if (!condComp) {
      return 0;
    }

    return condComp.currentHealth;
  }

  public setCurrentHp(entityId: number, hp: number): number {
    const entity = this.entityStore.getEntity(entityId);
    if (!entity) {
      return 0;
    }
    const condComp = entity.getComponent(ComponentType.CONDITION) as ConditionComponent;
    if (!condComp) {
      return 0;
    }

    return condComp.currentHealth;
  }
}

class ComponentCopyHelper {
  constructor(
    private readonly entityStore: EntityStore
  ) {
  }

  public copyComponent(entityId: number, type: ComponentType): Component {
    const entity = this.entityStore.getEntity(entityId);
    const comp = entity.getComponent(type);
    const copyComp = Object.assign({}, comp);
    return copyComp;
  }
}

export class ServerLocalFacade {

  private readonly PLAYER_ENTITY_ID = 1;

  private condHelper = new ConditionHelper(this.entityStore);
  private copyHelper = new ComponentCopyHelper(this.entityStore);

  constructor(
    private readonly entityStore: EntityStore
  ) {
    PubSub.subscribe(Topics.IO_SEND_MSG, (_, msg: any) => this.receivedFromClient(msg));
  }

  private receivedFromClient(message: any) {
    if (message instanceof BasicAttackMessage) {
      this.handleBasicAttack(message);
    } else if (message instanceof SyncRequestMessage) {
      this.setupClient();
    } else if (message instanceof AbortPerformMessage) {
      const deleteMessage = new ComponentDeleteMessage(this.PLAYER_ENTITY_ID, ComponentType.PERFORM);
      this.sendClient(deleteMessage);
    } else {
      LOG.warn(`Unknown client message received: ${JSON.stringify(message)}`);
    }
  }

  private setupClient() {
    const perfComp = new PerformComponent(
      71235,
      this.PLAYER_ENTITY_ID
    );
    perfComp.duration = 10000;
    perfComp.skillname = 'chop_tree';
    this.entityStore.addComponent(perfComp);
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
    const entity = this.entityStore.getEntity(entityId);
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

  public sendMessage(msg: Message<any>) {
    throw new Error('Method not implemented.');
  }

  private sendClient(msg: any) {
    PubSub.publish(Topics.IO_RECV_MSG, msg);
  }
}
