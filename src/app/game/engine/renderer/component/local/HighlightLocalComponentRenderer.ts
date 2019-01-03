import { ComponentRenderer } from '../ComponentRenderer';
import { Entity, ComponentType, HighlightComponent } from 'app/game/entities';
import { EngineContext } from 'app/game/engine/EngineContext';

export interface HighlightData {
  highlightSprite: Phaser.GameObjects.Sprite;
}

export class HighlightLocalComponentRenderer extends ComponentRenderer<HighlightComponent> {

  constructor(
    private readonly ctx: EngineContext
  ) {
    super(ctx.game);
  }

  protected hasNotSetup(entity: Entity, component: HighlightComponent): boolean {
    return !entity.data.highlight;
  }

  get supportedComponent(): ComponentType {
    return ComponentType.LOCAL_HIGHLIGHT;
  }

  protected createGameData(entity: Entity, component: HighlightComponent) {
    const entitySpriteData = entity.data.visual;
    if (!entitySpriteData) {
      return;
    }

    const entitySprite = entitySpriteData.sprite;
    const highlightSprite = this.ctx.game.add.sprite(entitySprite.x, entitySprite.y, entitySpriteData.spriteName);
    highlightSprite.setScale(1.3);
    highlightSprite.z = entitySprite.z - 1;
    highlightSprite.rotation = entitySprite.rotation;
    highlightSprite.setTintFill(component.color);

    entity.data.highlight = {
      highlightSprite: highlightSprite
    };
  }

  removeGameData(entity: Entity) {
    if (!entity.data.highlight) {
      return;
    }
    entity.data.highlight.highlightSprite.destroy();
    entity.data.highlight = null;
  }

  protected updateGameData(entity: Entity, component: HighlightComponent) {
    entity.data.highlight.highlightSprite.setTintFill(component.color);
  }
}
