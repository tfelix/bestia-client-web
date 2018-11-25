import { Component } from './Component';
import { ComponentType } from './ComponentType';

export enum EntityTraits {
  ATTACKABLE,
  USABLE,
  LOOTABLE,
  READABLE
}

export class EntityTraitsComponent extends Component {

  public traits: EntityTraits[] = [];

  constructor(
    id: number,
    entityId: number
  ) {
    super(id, entityId, ComponentType.ENTITY_TYPE);
  }
}
