import { Point } from 'app/game/model';

import { Component } from './Component';
import { ComponentType } from './ComponentType';
import { Entity } from '..';

export class PositionComponent extends Component {

  public position: Point;
  public isSightBlocked: boolean;

  public static getDistance(e1: Entity, e2: Entity) {
    if (!e1 || !e2) {
      return -1;
    }
    const pc1 = e1.getComponent(ComponentType.POSITION) as PositionComponent;
    const pc2 = e2.getComponent(ComponentType.POSITION) as PositionComponent;
    if (!pc1 || !pc2) {
      return -1;
    }

    return pc1.position.getDistance(pc2.position);
  }

  constructor(
    id: number,
    entityId: number
  ) {
    super(id, entityId, ComponentType.POSITION);
  }
}
