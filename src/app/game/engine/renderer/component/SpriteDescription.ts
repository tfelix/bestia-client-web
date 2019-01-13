import { Point } from 'app/game/model';

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

export interface FxDescriptionData {
  burning: [{
    x: number,
    y: number
  }];
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
  fxData?: FxDescriptionData;
}
