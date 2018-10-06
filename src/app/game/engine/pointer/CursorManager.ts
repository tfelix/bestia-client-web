import * as LOG from 'loglevel';

import { UIConstants, UIAtlas } from 'app/game/ui';

import { EngineContext } from '../EngineContext';
import { VisualDepth } from '../renderer/VisualDepths';

export enum CursorType {
  DEFAULT,
  ATTACK
}

const cursorSprites = new Map<CursorType, string>();
cursorSprites.set(CursorType.DEFAULT, UIConstants.CURSOR_HAND);
cursorSprites.set(CursorType.ATTACK, UIConstants.CURSOR_ATTACK);

export class CursorManager {

  private readonly cursors = new Map<CursorType, Phaser.GameObjects.Image>();
  private activeCursor: Phaser.GameObjects.Image;

  constructor(
    private readonly ctx: EngineContext
  ) {
  }

  public setCursorSprite(cursorType: CursorType) {
    const newCursor = this.cursors.get(cursorType);
    if (!newCursor) {
      LOG.warn(`Unknown cursor type requested: ${cursorType}`);
    }
    this.activeCursor.visible = false;
    this.activeCursor = newCursor;
    this.activeCursor.visible = true;
  }

  public create() {
    const uiScene = this.ctx.game.scene.get('UiScene');
    cursorSprites.forEach((spriteName, type) => {
      const cursor = uiScene.add.image(0, 0, UIAtlas, spriteName);
      cursor.visible = false;
      cursor.setOrigin(0, 0);
      cursor.depth = VisualDepth.UI_CURSOR;
      this.cursors.set(type, cursor);
    });

    this.activeCursor = this.cursors.get(CursorType.DEFAULT);
    this.activeCursor.visible = true;
  }

  public update() {
    const pointerPos = this.ctx.game.input.activePointer.position;
    this.activeCursor.setPosition(pointerPos.x, pointerPos.y);
  }
}
