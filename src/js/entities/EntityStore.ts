import { Entity } from './Entity';

export class EntityStore {
  public entities: Map<number, Entity> = new Map();

  constructor() {
  }

  public getEntity(id: number): Entity {
    const e = this.entities.get(id);

    if (!e) {
      const newEntity = new Entity(id);
      this.addEntity(newEntity);
      return newEntity;
    }

    return e;
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
