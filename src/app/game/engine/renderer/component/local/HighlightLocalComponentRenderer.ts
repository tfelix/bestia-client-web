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
    super(ctx.gameScene);
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
    const highlightSprite = this.ctx.gameScene.add.sprite(entitySprite.x, entitySprite.y, entitySpriteData.spriteName);
    highlightSprite.setOrigin(entitySprite.originX, entitySprite.originY);
    highlightSprite.setScale(entitySprite.scaleX * 1.3, entitySprite.scaleY * 1.3);
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
    const entitySprite = entity.data.visual && entity.data.visual.sprite;
    if (!entitySprite) {
      return;
    }

    const highlightSprite = entity.data.highlight.highlightSprite;

    highlightSprite.setOrigin(entitySprite.originX, entitySprite.originY);
    highlightSprite.depth = entitySprite.depth - 1;
    highlightSprite.rotation = entitySprite.rotation;
    highlightSprite.setTintFill(component.color);
    // The simple scaling does ofc not work. We need a better way of highlighting the sprite.
    // Maybe a shader must be utilized.
    highlightSprite.setScale(entitySprite.scaleX * 1.3, entitySprite.scaleY * 1.1);
    const yScaleOffset = (highlightSprite.displayHeight - entitySprite.displayHeight) / 2;
    highlightSprite.setPosition(entitySprite.x, entitySprite.y + yScaleOffset);
    highlightSprite.setFrame(entitySprite.frame.name);
    highlightSprite.flipX = entitySprite.flipX;
    highlightSprite.setTintFill(component.color);
  }
}
