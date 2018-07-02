import { Component } from './Component';
import { ComponentType } from './ComponentType';

enum InteractionType {
  READ,
  OPEN,
  ATTACK,
  SPEAK,
  LOOT
}

// FIXME Interaction fertigstellen
export class InteractionComponent extends Component {

  public possibleInteraction: InteractionType[] = [];

  constructor(id: number, entityId: number) {
    super(id, entityId, ComponentType.INTERACTION);
  }
}
