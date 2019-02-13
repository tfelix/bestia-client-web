import { Component } from './Component';
import { ComponentType } from './ComponentType';
import { Vec2 } from 'app/game/model';

export class VegetationComponent extends Component {

  public spriteSheet: string;
  public overlaySprite: string;
  public hullPoints: Vec2[];

  constructor(
    id: number,
    entityId: number
  ) {
    super(id, entityId, ComponentType.VEGETATION);
  }
}
