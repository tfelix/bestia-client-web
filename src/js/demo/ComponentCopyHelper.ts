import { EntityStore } from 'entities';
import { ComponentType, Component } from 'entities/components';

export class ComponentCopyHelper {
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
