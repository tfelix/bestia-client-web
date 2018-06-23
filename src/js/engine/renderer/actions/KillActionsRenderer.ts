import { ActionsRenderer } from './ActionsRenderer';
import { Entity, KillAction } from 'entities';
import { ComponentType, VisualComponent } from 'entities/components';

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
