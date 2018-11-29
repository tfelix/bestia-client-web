import { ComponentType, EntityType, EntityTypeComponent } from './components';
import { InteractionType } from './components/local/InteractionLocalComponent';
import { Entity } from './Entity';

export class InteractionService {

  private interactionCache: Map<EntityType, InteractionType> = new Map();

  constructor() {
    // Setup the default interactions
    this.interactionCache.set(EntityType.MOB, InteractionType.ATTACK);
    this.interactionCache.set(EntityType.ITEM, InteractionType.LOOT);
  }

  public storeSettings() {
    const interactionJson = JSON.stringify(Array.from(this.interactionCache.entries()));
    localStorage.setItem('interactionCache', interactionJson);
  }

  public loadSettings() {
    this.interactionCache = new Map(JSON.parse(localStorage.getItem('interactionCache')));
  }

  public getDefaultInteraction(entity: Entity): InteractionType | null {
    const typeComp = entity.getComponent(ComponentType.ENTITY_TYPE) as EntityTypeComponent;

    if (!typeComp) {
      return null;
    }

    return this.interactionCache.get(typeComp.entityType);
  }
}
