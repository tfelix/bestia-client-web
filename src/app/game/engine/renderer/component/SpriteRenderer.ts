import { Px } from 'app/game/model';
import { SpriteType } from 'app/game/engine';
import { Entity, VisualComponent } from 'app/game/entities';

export interface SpriteData {
  sprite: Phaser.GameObjects.Sprite;
  spriteName: string;
  lastPlayedAnimation?: string;
  childSprites: Array<{
    spriteName: string;
    sprite: Phaser.GameObjects.Sprite;
  }>;
}

export abstract class SpriteRenderer {

  protected setupSpriteData(
    sprite: Phaser.GameObjects.Sprite,
    entity: Entity,
    spriteName: string
  ) {
    sprite.setData('entity_id', entity.id);
    sprite.setInteractive({ pixelPerfect: true });
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
