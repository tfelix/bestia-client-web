import { Entity, ComponentType, ConditionComponent } from 'app/game/entities';

import { ComponentRenderer } from './ComponentRenderer';
import { EngineContext } from '../../EngineContext';
import { SceneNames } from '../../scenes/SceneNames';
import { MapHelper } from '../../MapHelper';

export interface ConditionData {
  conditionGraphic: Phaser.GameObjects.Graphics;
}

const bottomHealtbarOffset = 8;
const conditionBarHeight = 6;
const rect = new Phaser.Geom.Rectangle();

export class ConditionComponentRenderer extends ComponentRenderer<ConditionComponent> {

  private readonly uiScene: Phaser.Scene;

  constructor(
    private readonly ctx: EngineContext
  ) {
    super(ctx.gameScene);

    this.uiScene = ctx.gameScene.scene.get(SceneNames.UI);
  }

  get supportedComponent(): ComponentType {
    return ComponentType.CONDITION;
  }

  protected hasNotSetup(entity: Entity, component: ConditionComponent): boolean {
    return !entity.data.condition;
  }

  protected createGameData(entity: Entity, component: ConditionComponent) {
    const condGfx = this.uiScene.add.graphics();
    condGfx.fillStyle(0x00AA00, 1);
    entity.data.condition = {
      conditionGraphic: condGfx
    };
  }

  protected updateGameData(entity: Entity, component: ConditionComponent) {
    this.clearGraphics(entity);
    this.drawHealthBar(entity, component);
  }

  protected removeComponent(entity: Entity, component: ConditionComponent) {
    this.clearGraphics(entity);
    entity.data.condition.conditionGraphic = null;
  }

  private clearGraphics(entity: Entity) {
    entity.data.condition.conditionGraphic.clear();
  }

  private drawHealthBar(entity: Entity, component: ConditionComponent) {
    const sprite = entity.data.visual && entity.data.visual.sprite;
    if (!sprite) {
      return;
    }

    const gfx = entity.data.condition.conditionGraphic;
    const maxWidth = this.ctx.helper.sprite.getSpriteSize(sprite).width;
    const hpPerc = Math.max(0, component.currentHealth / component.maxHealth);

    const isFullHp = hpPerc > 0.999;
    const isZeroHp = hpPerc <= 0.001;
    if (isZeroHp || isFullHp) {
      this.clearGraphics(entity);
      return;
    }

    rect.height = conditionBarHeight;

    const localPos = MapHelper.worldToSceneLocal(this.ctx.gameScene.cameras.main, sprite.x, sprite.y);
    rect.x = localPos.x - maxWidth / 2;
    rect.y = localPos.y + bottomHealtbarOffset;
    rect.width = maxWidth;

    // Draw background
    gfx.fillStyle(0x000000, 0.5);
    gfx.fillRectShape(rect);

    // Draw health.
    gfx.fillStyle(0x33F30D);
    rect.x += 1;
    rect.y += 1;
    rect.width -= 2;
    rect.width *= hpPerc;
    rect.height -= 2;
    gfx.fillRectShape(rect);
  }
}
