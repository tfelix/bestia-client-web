import { LocalComponent } from './LocalComponent';
import { ComponentType } from 'entities/components';

export class MasterLocalComponent extends LocalComponent {

  constructor(entitiyId: number) {
    super(entitiyId, ComponentType.LOCAL_MASTER);
  }
}
