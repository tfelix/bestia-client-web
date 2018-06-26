import { EngineContext } from 'engine';
import { SpriteRenderer } from './SpriteRenderer';
import { Entity } from 'entities';
import { VisualComponent, SpriteType } from 'entities/components';
import { Px } from 'model';
import { SpriteData } from 'engine/renderer';

export class ItemSpriteRenderer extends SpriteRenderer {

  constructor(
    private ctx: EngineContext
  ) {
    super();
  }

  public supportedType(): SpriteType {
    return SpriteType.ITEM;
  }

  public createGameData(entity: Entity, component: VisualComponent, pxPos: Px) {
    const sprite = this.ctx.game.add.sprite(pxPos.x, pxPos.y, component.sprite);
    this.setupSpriteData(sprite, entity, component.sprite);
  }

  public updateGameData(entity: Entity, component: VisualComponent, pxPos: Px, spriteData: SpriteData) {
    this.updateSpriteDepth(entity.data.visual);
  }
}
