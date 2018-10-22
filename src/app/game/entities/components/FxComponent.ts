import { Component } from './Component';
import { ComponentType } from './ComponentType';

export class FxComponent extends Component {

  public fxTags = new Set<string>();

  constructor(
    id: number,
    entityId: number
  ) {
    super(id, entityId, ComponentType.FX);
  }
}
