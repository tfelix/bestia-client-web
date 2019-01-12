import { Entity } from './Entity';
import { ComponentType } from './components/ComponentType';
import { Component } from './components/Component';

export class EntityStore {
  public readonly entities: Map<number, Entity> = new Map();

  public getEntity(id: number): Entity {
    const e = this.entities.get(id);

    if (!e) {
      const newEntity = new Entity(id);
      this.addEntity(newEntity);
      return newEntity;
    }

    return e;
  }

  public getComponentFromEntityId<T extends Component>(entityId: number, type: ComponentType): T {
    const e = this.getEntity(entityId);

    return e.getComponent(type) as T;
  }

  public getAllEntitiesWithComponents(...types: ComponentType[]): Entity[] {
    const foundEntities = [];
    for (const entity of this.entities.values()) {
      if (types.every(t => entity.hasComponent(t))) {
        foundEntities.push(entity);
      }
    }

    return foundEntities;
  }

  public addEntity(entity: Entity) {
    this.entities.set(entity.id, entity);
  }

  public removeEntity(entityId: number) {
    const entity = this.entities.get(entityId);
    for (const component of entity.getComponentIterator()) {
      entity.removeComponentByType(component.type);
    }
    this.entities.delete(entityId);
  }
}
