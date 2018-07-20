import { Entity } from 'entities';
import { SpriteData } from '..';
import { SpriteType, VisualComponent } from 'entities/components';
import { Px } from 'model';

export abstract class SpriteRenderer {

  protected setupSpriteData(
    sprite: Phaser.GameObjects.Sprite,
    entity: Entity,
    spriteName: string
  ) {
    sprite.setData('entity_id', entity.id);
    sprite.setInteractive();
    const spriteData: SpriteData = {
      sprite: sprite,
      spriteName: spriteName,
      childSprites: []
    };
    entity.data.visual = spriteData;
  }

  protected updateSpriteDepth(spriteData: SpriteData) {
    spriteData.sprite.depth = spriteData.sprite.y;
    spriteData.childSprites.forEach(s => {
      s.sprite.depth = spriteData.sprite.depth;
    });
  }

  public abstract supportedType(): SpriteType;

  public abstract updateGameData(entity: Entity, component: VisualComponent, pxPos: Px, spriteData: SpriteData);

  public abstract createGameData(entity: Entity, component: VisualComponent, pxPos: Px);
}
