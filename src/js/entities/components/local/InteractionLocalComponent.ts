import { LocalComponent } from './LocalComponent';
import { ComponentType } from '..';

export class InteractionLocalComponent extends LocalComponent {

  constructor(entityId: number) {
    super(entityId, ComponentType.LOCAL_INTERACTION);
  }
}
