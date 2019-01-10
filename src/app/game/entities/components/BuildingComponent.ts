import { Component } from './Component';
import { ComponentType } from './ComponentType';

export class BuildingComponent extends Component {

  public spriteSheet: string;
  public innerSprite: string;
  public outerSprite: string | null;

  public connectedEntityIds: {
    top: number | null,
    right: number | null,
    bottom: number | null,
    left: number | null
  };

  constructor(
    id: number,
    entityId: number
  ) {
    super(id, entityId, ComponentType.BUILDING);
  }
}
