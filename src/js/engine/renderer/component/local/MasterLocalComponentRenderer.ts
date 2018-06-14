import * as LOG from 'loglevel';

import { ComponentRenderer } from '..';
import { MasterLocalComponent } from 'entities/components/local/MasterLocalComponent';
import { ComponentType } from 'entities/components';
import { Entity } from 'entities';
import { EngineContext } from '../../../EngineContext';

let entityIdCameraFollows = -1;

export class MasterLocalComponentRenderer extends ComponentRenderer<MasterLocalComponent> {

  constructor(
    private readonly ctx: EngineContext
  ) {
    super(ctx.game);
  }

  get supportedComponent(): ComponentType {
    return ComponentType.LOCAL_MASTER;
  }

  protected hasNotSetup(entity: Entity, component: MasterLocalComponent): boolean {
    return (entityIdCameraFollows !== entity.id);
  }

  protected createGameData(entity: Entity, component: MasterLocalComponent) {
    const sprite = entity.data.visual && entity.data.visual.sprite;
    if (!sprite) {
      return;
    }

    LOG.debug(`Setting camera follow to entity ${entity.id}.`);
    this.ctx.game.cameras.main.startFollow(sprite);
    entityIdCameraFollows = entity.id;
  }

  protected updateGameData(entity: Entity, component: MasterLocalComponent) {
  }

  protected removeComponent(entity: Entity, component: MasterLocalComponent) {
  }
}
