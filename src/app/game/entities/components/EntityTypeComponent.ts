import { Component } from './Component';
import { ComponentType } from '.';

export enum EntityType {
  BESTIA,
  PLAYER_BESTIA,
  NPC,
  ITEM,
  RESOURCE,
  OBJECT
}

export class EntityTypeComponent extends Component {

  public entityType?: EntityType = EntityType.OBJECT;

  constructor(
    id: number,
    entityId: number
  ) {
    super(id, entityId, ComponentType.ENTITY_TYPE);
  }
}
