import { EntityStore, Entity } from 'app/game/entities';

/**
 * This is a modified version of the EntityStore which is useful too access
 * the entities via some sort of string identifier like a name.
 *
 * TODO: It will be important to categorize entities with some kind of tag
 * in order to group them for their behavior by the demo code.
 */
export class ServerEntityStore {

  private entityStore = new EntityStore();
  private entityIdentifierStore = new Map<string, number>();

  public getEntityByIdentifier(ident: string): Entity {
    const entityId = this.entityIdentifierStore.get(ident);
    return this.entityStore.getEntity(entityId);
  }

  public addIdentifier(ident: string, entity: Entity) {
    this.entityIdentifierStore.set(ident, entity.id);
  }

  public addEntityWithIdentifier(ident: string, entity: Entity) {
    this.addEntity(entity);
    this.addIdentifier(ident, entity);
  }

  public addEntity(entity: Entity) {
    this.entityStore.addEntity(entity);
  }

  public getEntity(entityId: number): Entity {
    return this.entityStore.getEntity(entityId);
  }
}