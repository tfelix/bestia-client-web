import { Component } from './Component';
import { ComponentType } from './ComponentType';

export class PerformComponent extends Component {

  public skillname = '';
  public duration = 0;
  public canMove = true;
  public canAbort = true;

  constructor(
    id: number,
    entityId: number
  ) {
    super(id, entityId, ComponentType.PERFORM);
  }
}
