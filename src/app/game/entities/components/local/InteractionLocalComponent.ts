import { ComponentType } from '../ComponentType';
import { LocalComponent } from './LocalComponent';

export enum InteractionType {
  READ,
  ATTACK,
  SPEAK,
  LOOT,
  FISH,
  USE
}

export class InteractionLocalComponent extends LocalComponent {

  public possibleInteractions = new Set<InteractionType>();
  public activeInteraction: InteractionType | null = null;

  constructor(entityId: number) {
    super(entityId, ComponentType.LOCAL_INTERACTION);
  }
}
