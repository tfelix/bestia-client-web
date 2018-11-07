import { Point } from 'app/game/model/Point';

import { Component } from './Component';
import { ComponentType } from './ComponentType';

export class MoveComponent extends Component {

  public walkspeed = 1;
  public path: Point[];

  /**
   * In order to realize something like this we probably need a server move component and a local
   * move component. Incoming server move components will then spawn the local variant of this components.
   */
  public onMoveFinished: Array<() => void> = [];

  constructor(
    id: number,
    entityId: number
  ) {
    super(id, entityId, ComponentType.MOVE);
  }
}
