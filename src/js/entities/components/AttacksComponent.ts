import { Component } from './Component';
import { ComponentType } from '.';

export class AttacksComponent extends Component {

  public basicAttackRange = 1;
  public basicAttacksPerSecond = 0.8;

  constructor(
    id: number,
    entityId: number
  ) {
    super(id, entityId, ComponentType.ATTACKS);
  }
}
