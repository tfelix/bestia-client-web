import { Component } from './Component';
import { ComponentType } from './ComponentType';

export enum Interaction {
  ATTACKABLE,
  USABLE,
  LOOTABLE,
  READABLE
}

export class InteractionComponent extends Component {

  public interactions: Interaction[] = [];

  constructor(
    id: number,
    entityId: number
  ) {
    super(id, entityId, ComponentType.ENTITY_TYPE);
  }
}
