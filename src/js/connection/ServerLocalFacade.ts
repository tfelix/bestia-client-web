import * as PubSub from 'pubsub-js';
import { Topics } from 'Topics';
import { BasicAttackMessage } from 'message/BasicAttackMessage';
import { ServerConnection } from './ServerConnection';
import { EntityStore } from 'entities';
import { DamageAction } from 'entities/actions';
import { Message } from 'message/Message';
import { ActionMessage } from 'message/ActionMessage';
import { ComponentType } from 'entities/components';
import { ConditionComponent } from 'entities/components/ConditionComponent';

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
}

export class ServerLocalFacade implements ServerConnection {

  private condHelper = new ConditionHelper(this.entityStore);

  constructor(
    private readonly entityStore: EntityStore
  ) {
    PubSub.subscribe(Topics.IO_SEND_MSG, (_, msg: any) => this.receivedFromClient(msg));
  }

  private receivedFromClient(message: any) {
    if (message instanceof BasicAttackMessage) {
      this.handleBasicAttack(message);
    }
  }

  private handleBasicAttack(msg: BasicAttackMessage) {
    const dmg = Math.round(Math.random() * 15 + 5);
    const dmgAction = new DamageAction(dmg);
    const actionMsg = new ActionMessage<DamageAction>(msg.targetEntityId, dmgAction);
    PubSub.publish(Topics.IO_RECV_MSG, actionMsg);
  }

  public sendMessage(msg: Message<any>) {
    throw new Error('Method not implemented.');
  }
}
