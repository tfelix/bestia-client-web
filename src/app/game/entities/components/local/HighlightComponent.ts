import { LocalComponent } from './LocalComponent';
import { ComponentType } from '../ComponentType';

export class HighlightComponent extends LocalComponent {

  public color: integer;

  constructor(entityId: number) {
    super(entityId, ComponentType.LOCAL_HIGHLIGHT);
  }
}
