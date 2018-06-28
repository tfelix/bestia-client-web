import { Subject } from 'rxjs';

import { Entity } from './Entity';
import { Component } from './components';

export class EntityStore {
  public entities: Map<number, Entity> = new Map();

  constructor() {
  }

  public getEntity(id: number): Entity {
    const e = this.entities.get(id);

    if (!e) {
      const newEntity = new Entity(id, this);
      this.addEntity(newEntity);
      return newEntity;
    }

    return e;
  }

  /**
   * Updates the entity in the storage.
   * @param message Server update message for this entity.
   */
  public updateEntity(message: any) {

  }

  public addEntity(entity: Entity) {
    this.entities.set(entity.id, entity);
  }

  // DEPRICATED Can now be done directly on the entity. Maybe we keep this as a helper method.
  public addComponent(component: Component) {
    const e = this.getEntity(component.entityId);
    e.addComponent(component);
  }

  // DEPRICATED Can now be done directly on the entity.
  public removeComponent(component: Component) {
    const e = this.getEntity(component.entityId);
    if (!e) {
      return;
    }
    e.removeComponentByType(component.type);
  }

  public removeEntity(entityId: number) {
    const entity = this.entities.get(entityId);
    for (const component of entity.getComponentIterator()) {
      entity.removeComponentByType(component.type);
    }
    this.entities.delete(entityId);
  }
}
