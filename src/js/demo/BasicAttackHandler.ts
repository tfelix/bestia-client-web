import { ClientMessageHandler } from './ClientMessageHandler';
import { BasicAttackMessage, ActionMessage, ComponentMessage, ComponentDeleteMessage } from 'message';
import { EntityStore, DamageAction, KillAction } from 'entities';
import { ConditionHelper } from './ConditionHelper';
import { ComponentCopyHelper } from './ComponentCopyHelper';
import { ConditionComponent, ComponentType, VisualComponent } from 'entities/components';

export class BasicAttackHandler extends ClientMessageHandler<BasicAttackMessage> {

  private condHelper = new ConditionHelper(this.clientEntities);
  private copyHelper = new ComponentCopyHelper(this.clientEntities);

  constructor(
    private readonly clientEntities: EntityStore,
    private readonly serverEntities: EntityStore
  ) {
    super();

  }

  public isHandlingMessage(msg: any): boolean {
    return msg instanceof BasicAttackMessage;
  }

  public handle(msg: any) {
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
}
