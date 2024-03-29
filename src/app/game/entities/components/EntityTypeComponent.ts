import { Component } from './Component';
import { ComponentType } from './ComponentType';

export enum EntityType {
  MOB,
  NPC,
  PLAYER,
  OBJECT,
  RESOURCE,
  ITEM
}

export class EntityTypeComponent extends Component {

  public entityType: EntityType;

  constructor(
    id: number,
    entityId: number
  ) {
    super(id, entityId, ComponentType.ENTITY_TYPE);
  }
}
