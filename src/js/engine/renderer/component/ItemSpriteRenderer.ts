import { EngineContext } from 'engine';
import { SpriteRenderer } from './SpriteRenderer';
import { Entity } from 'entities';
import { VisualComponent, SpriteType } from 'entities/components';
import { Px } from 'model';
import { SpriteData } from 'engine/renderer';
import { bhash } from 'utils';

export class ItemSpriteRenderer extends SpriteRenderer {
  constructor(
    private ctx: EngineContext
  ) {
    super();
  }

  private setupRotation(sprite: Phaser.GameObjects.Sprite) {
    const posStr = `${sprite.x}-${sprite.y}`;
    const angle = bhash(posStr + posStr + posStr) % 50 - 25;
    sprite.angle = (angle < 0) ? angle + 360 : angle;
  }

  public supportedType(): SpriteType {
    return SpriteType.ITEM;
  }

  public createGameData(entity: Entity, component: VisualComponent, pxPos: Px) {
    const sprite = this.ctx.game.add.sprite(pxPos.x, pxPos.y, component.sprite);
    this.setupRotation(sprite);
    this.setupSpriteData(sprite, entity, component.sprite);
  }

  public updateGameData(entity: Entity, component: VisualComponent, pxPos: Px, spriteData: SpriteData) {
    this.updateSpriteDepth(entity.data.visual);
  }

  protected updateSpriteDepth(spriteData: SpriteData) {
    spriteData.sprite.depth = spriteData.sprite.y - 10;
  }
}
