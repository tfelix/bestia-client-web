import { Point } from 'app/game/model/Point';

import { Component } from './Component';
import { ComponentType } from './ComponentType';

export class MoveComponent extends Component {

  public walkspeed = 1;
  public path: Point[];

  /**
   * These properties are only used locally by the client.
   */
  public onMoveFinished: Array<() => void> = [];

  constructor(
    id: number,
    entityId: number
  ) {
    super(id, entityId, ComponentType.MOVE);
  }
}
