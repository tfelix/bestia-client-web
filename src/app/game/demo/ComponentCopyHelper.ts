import { ComponentType, Component } from 'app/game/entities';
import { ServerEntityStore } from './ServerEntityStore';

export class ComponentCopyHelper {
  constructor(
    private readonly entityStore: ServerEntityStore
  ) {
  }

  public copyComponent(entityId: number, type: ComponentType): Component {
    const entity = this.entityStore.getEntity(entityId);
    const comp = entity.getComponent(type);
    const copyComp = Object.assign({}, comp);
    return copyComp;
  }
}
