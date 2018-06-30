import { EntityType } from './components';

export enum InteractionType {
  ATTACK,
  PICKUP,
  INTERACT,
  NONE
}

export class InteractionCache {

  private readonly interactionCache: Map<EntityType, InteractionType> = new Map();

  constructor() {

    this.interactionCache.set(EntityType.BESTIA, InteractionType.ATTACK);
    this.interactionCache.set(EntityType.ITEM, InteractionType.PICKUP);
  }

  public get(type: EntityType): InteractionType | null {
    return this.interactionCache.get(type);
  }
}
