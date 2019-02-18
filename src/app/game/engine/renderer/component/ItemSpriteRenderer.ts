import { Px } from 'app/game/model';
import { bhash } from 'app/game/utils';
import { Entity, VisualComponent } from 'app/game/entities';

import { EngineContext } from '../../EngineContext';
import { SpriteRenderer, SpriteData } from './SpriteRenderer';
import { SpriteType } from '../component/SpriteDescription';

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
    const sprite = this.ctx.gameScene.add.sprite(pxPos.x, pxPos.y, component.sprite);
    this.setupRotation(sprite);
    this.setupSpriteData(sprite, entity, component.sprite);
  }

  public updateGameData(entity: Entity, component: VisualComponent, pxPos: Px, spriteData: SpriteData) {
    this.updateSpriteDepth(entity.data.visual);
  }

  protected updateSpriteDepth(spriteData: SpriteData) {
    const scrollOffset = this.ctx.helper.display.getScrollOffsetPx();
    spriteData.sprite.depth = spriteData.sprite.y - scrollOffset.y - 10;
  }
}
