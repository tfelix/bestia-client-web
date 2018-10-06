import { Component } from '../Component';
import { ComponentType } from '../ComponentType';

export const LOCAL_COMPONENT_ID = -1;

export class LocalComponent extends Component {
  constructor(entityId: number, componentType: ComponentType) {
    super(LOCAL_COMPONENT_ID, entityId, componentType);
  }
}
