import { LocalComponent } from './LocalComponent';
import { ComponentType } from '../ComponentType';

export class SelectLocalComponent extends LocalComponent {

  constructor(entityId: number) {
    super(entityId, ComponentType.LOCAL_SELECT);
  }
}
