
import {
  Entity, ComponentType, VegetationComponent
} from 'app/game/entities';

import { ComponentRenderer } from './ComponentRenderer';
import { EngineContext } from '../../EngineContext';

export class VegetationComponentRenderer extends ComponentRenderer<VegetationComponent> {

  constructor(
    ctx: EngineContext
  ) {
    super(ctx.gameScene);

  }

  get supportedComponent(): ComponentType {
    return ComponentType.VEGETATION;
  }

  protected hasNotSetup(entity: Entity, component: VegetationComponent): boolean {
    return !entity.data.visual;
  }

  protected createGameData(entity: Entity, component: VegetationComponent) {

  }

  protected updateGameData(entity: Entity, component: VegetationComponent) {

  }
}
