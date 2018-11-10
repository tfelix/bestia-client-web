import * as LOG from 'loglevel';

import { ComponentRenderer } from '../ComponentRenderer';
import { Entity, ComponentType, MasterLocalComponent } from 'app/game/entities';
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
    const masterSprite = entity.data.visual && entity.data.visual.sprite;
    if (!masterSprite) {
      return;
    }

    LOG.debug(`Setting camera follow to entity ${entity.id}.`);
    this.ctx.game.cameras.main.startFollow(masterSprite);
    entityIdCameraFollows = entity.id;

    // Enabling collision on the player sprite for event triggering of the engine.
    this.ctx.game.physics.world.enable(masterSprite, Phaser.Physics.Arcade.DYNAMIC_BODY);
  }

  protected updateGameData(entity: Entity, component: MasterLocalComponent) {
  }
}
