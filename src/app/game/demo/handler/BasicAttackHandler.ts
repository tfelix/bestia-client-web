import { ClientMessageHandler } from './ClientMessageHandler';
import { BasicAttackMessage, ActionMessage, ComponentMessage, ComponentDeleteMessage } from 'app/game/message';
import { DamageAction, KillAction } from 'app/game/entities';
import { ConditionHelper } from '../ConditionHelper';
import { ComponentCopyHelper } from '../ComponentCopyHelper';
import { ConditionComponent, ComponentType, VisualComponent, PositionComponent } from 'app/game/entities/components';
import { ServerEntityStore } from '../ServerEntityStore';
import { EntityLocalFactory } from '../EntityLocalFactory';

export class BasicAttackHandler extends ClientMessageHandler<BasicAttackMessage> {

  private condHelper = new ConditionHelper(this.serverEntities);
  private copyHelper = new ComponentCopyHelper(this.serverEntities);

  constructor(
    serverEntities: ServerEntityStore,
    private readonly entityFactory: EntityLocalFactory
  ) {
    super(serverEntities);
  }

  public isHandlingMessage(msg: any): boolean {
    return msg instanceof BasicAttackMessage;
  }

  public handle(msg: any) {
    // TODO Improve damage calculation here
    const dmg = Math.round(Math.random() * 15 + 5);

    const currentHp = this.condHelper.getCurrentHp(msg.targetEntityId);
    const newHp = currentHp - dmg;
    this.condHelper.setCurrentHp(msg.targetEntityId, newHp);

    const dmgAction = new DamageAction(dmg);
    const actionMsg = new ActionMessage<DamageAction>(msg.targetEntityId, dmgAction);
    this.sendClient(actionMsg);

    if (newHp <= 0) {
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

    const killAction = new KillAction();
    const killActionMsg = new ActionMessage<KillAction>(entityId, killAction);
    this.sendClient(killActionMsg);

    const positionComp = entity.getComponent(ComponentType.POSITION) as PositionComponent;
    this.sendAllComponents(this.entityFactory.addItemKnife(positionComp.position));

    const visualComp = this.copyHelper.copyComponent(entityId, ComponentType.VISUAL) as VisualComponent;
    visualComp.animation = 'kill';
    const compMsg = new ComponentMessage<VisualComponent>(visualComp);
    this.sendClient(compMsg);

    const deleteComponentIds = [];
    deleteComponentIds.forEach(id => {
      const deleteMessage = new ComponentDeleteMessage(entityId, id);
      this.sendClient(deleteMessage);
    });
  }
}
