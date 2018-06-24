import { Component } from './Component';
import { ComponentType } from './ComponentType';

export class PerformComponent extends Component {

  public skillname = '';
  public duration = 0;

  constructor(
    id: number,
    entityId: number
  ) {
    super(id, entityId, ComponentType.PERFORM);
  }
}
