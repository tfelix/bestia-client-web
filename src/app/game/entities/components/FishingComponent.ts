import { Component } from './Component';
import { ComponentType } from './ComponentType';

export class FishingComponent extends Component {

  public seed: number;
  public targetPoint: { x: number, y: number };
  public hasClickedFishingAction = false;

  constructor(
    id: number,
    entityId: number
  ) {
    super(id, entityId, ComponentType.FISHING);
  }
}
