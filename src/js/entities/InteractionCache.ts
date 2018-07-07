import { EntityType } from './components';
import { InteractionType } from './components/local/InteractionLocalComponent';

export class InteractionCache {

  private readonly interactionCache: Map<EntityType, InteractionType> = new Map();

  constructor() {

    this.interactionCache.set(EntityType.BESTIA, InteractionType.ATTACK);
    this.interactionCache.set(EntityType.ITEM, InteractionType.LOOT);
  }

  public get(type: EntityType): InteractionType | null {
    return this.interactionCache.get(type);
  }
}
