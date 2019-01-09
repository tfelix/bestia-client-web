import { ComponentType, ConditionComponent } from 'app/game/entities';
import { ServerEntityStore } from './ServerEntityStore';

export class ConditionHelper {

  constructor(
    private readonly entityStore: ServerEntityStore
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

  public setCurrentHp(entityId: number, hp: number): void {
    const entity = this.entityStore.getEntity(entityId);
    if (!entity) {
      return;
    }
    const condComp = entity.getComponent(ComponentType.CONDITION) as ConditionComponent;
    if (!condComp) {
      return;
    }

    condComp.currentHealth = hp;
  }
}
