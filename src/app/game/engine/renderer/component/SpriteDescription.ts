import { Point } from 'app/game/model';

export interface SpriteData {
  sprite: Phaser.GameObjects.Sprite;
  spriteName: string;
  lastPlayedAnimation?: string;
  childSprites: Array<{
    spriteName: string;
    sprite: Phaser.GameObjects.Sprite;
  }>;
}

export interface SpriteAnimation {
  name: string;
  from: number;
  to: number;
  fps: number;
}

export enum SpriteType {
  MULTI,
  SIMPLE,
  ITEM
}

export interface SpriteDescription {
  name: string;
  type: SpriteType;
  version: number;
  scale: number;
  animations: SpriteAnimation[];
  anchor: Point;
  multiSprite: string[];
  collision?: number[][];
}

export function getSpriteDescriptionFromCache(
  spriteName: string,
  scene: Phaser.Scene
): SpriteDescription {
  return scene.cache.json.get(`${spriteName}_desc`);
}
