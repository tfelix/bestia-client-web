import { LocalComponent } from './LocalComponent';
import { ComponentType } from '..';
import { EntityType } from '../EntityTypeComponent';

export enum InteractionType {
  ATTACK,
  PICKUP,
  INTERACT,
  NONE
}

export class InteractionCacheLocalComponent extends LocalComponent {

  public readonly interactionCache: Map<EntityType, InteractionType> = new Map();

  constructor(entityId: number) {
    super(entityId, ComponentType.LOCAL_INTERACTION_CACHE);
  }
}
