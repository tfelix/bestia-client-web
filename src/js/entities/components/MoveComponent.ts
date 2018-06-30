import { Component } from './Component';
import { Point } from '../../model/Point';
import { ComponentType } from './ComponentType';

export class MoveComponent extends Component {

  public walkspeed = 1;
  public path: Point[];
  public onMoveFinished: Array<() => void> = [];

  constructor(
    id: number,
    entityId: number
  ) {
    super(id, entityId, ComponentType.MOVE);
  }
}
