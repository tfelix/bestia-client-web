import { Entity, KillAction, ComponentType, VisualComponent } from 'app/game/entities';

import { ActionsRenderer } from './ActionsRenderer';

export class KillActionsRenderer extends ActionsRenderer {

  constructor(
    readonly game: Phaser.Scene
  ) {
    super(game);
  }

  public needsUpdate(entity: Entity): boolean {
    return entity.hasAction(KillAction);
  }

  protected doUpdate(entity: Entity) {
    const visualComp = entity.getComponent(ComponentType.VISUAL) as VisualComponent;
    visualComp.oneshotAnimation = 'die';
  }

  public getLastUpdateDetails(): [[string, number]] {
    return [['', this.getLastUpdateTimeMs()]];
  }
}
