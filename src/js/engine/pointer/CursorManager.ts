import { UIConstants } from 'ui';

export enum CursorType {
  DEFAULT,
  ATTACK
}

const cursorSprites = new Map<CursorType, string>();
cursorSprites.set(CursorType.DEFAULT, UIConstants.CURSOR_HAND);
cursorSprites.set(CursorType.ATTACK, UIConstants.CURSOR_ATTACK);

export class CursorManager {

  public setCursorSprite() {

  }

  public update() {

  }
}
