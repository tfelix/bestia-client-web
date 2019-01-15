import { Entity, DamageAction, ComponentType, VisualComponent } from 'app/game/entities';

import { ActionsRenderer } from './ActionsRenderer';
import { SceneNames } from '../../scenes/SceneNames';
import { TextStyles } from '../../TextStyles';
import { MapHelper } from '../../MapHelper';

export class DamageActionsRenderer extends ActionsRenderer {

  private readonly uiScene: Phaser.Scene;

  constructor(gameScene: Phaser.Scene) {
    super(gameScene);

    this.uiScene = gameScene.scene.get(SceneNames.UI);
  }

  public needsUpdate(entity: Entity): boolean {
    return entity.actions.findIndex(x => x instanceof DamageAction) !== -1;
  }

  public doUpdate(entity: Entity) {
    const actions = this.getActionsFromEntity<DamageAction>(entity, DamageAction);

    const visual = entity.data.visual;
    if (!visual || !visual.sprite) {
      return;
    }

    const visualComp = entity.getComponent(ComponentType.VISUAL) as VisualComponent;
    if (visualComp) {
      visualComp.oneshotAnimation = 'hit';
    }

    actions.forEach(a => {
      const dmgTxt = String(a.totalAmount);

      const spriteLocalPos = MapHelper.worldPxToSceneLocal(this.gameScene.cameras.main, visual.sprite.x, visual.sprite.y);

      const txt = this.uiScene.add.text(
        spriteLocalPos.x,
        spriteLocalPos.y - visual.sprite.height / 2,
        dmgTxt,
        TextStyles.DAMAGE
      );
      txt.setOrigin(0.5, 0.5);
      txt.depth = 10000;
      this.uiScene.tweens.add({
        targets: txt,
        y: { value: spriteLocalPos.y - 130, duration: 1000, ease: 'Linear' },
        alpha: { value: 0, duration: 200, delay: 800, ease: 'Linear' },
        onComplete: () => txt.destroy()
      });
    });
  }

  public getLastUpdateDetails(): [[string, number]] {
    return [['action:damage', this.getLastUpdateTimeMs()]];
  }
}
