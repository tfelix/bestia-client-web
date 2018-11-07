import * as LOG from 'loglevel';

import { UIConstants, UIAtlas } from 'app/game/ui';
import { EngineEvents } from 'app/game/message';

import { EngineContext } from '../EngineContext';
import { VisualDepth } from '../renderer/VisualDepths';
import { Px } from 'app/game/model';

export enum CursorType {
  DEFAULT,
  ATTACK
}

const cursorSprites = new Map<CursorType, string>();
cursorSprites.set(CursorType.DEFAULT, UIConstants.CURSOR_HAND);
cursorSprites.set(CursorType.ATTACK, UIConstants.CURSOR_ATTACK);

/**
 * The cursor manager is responsible for the graphics shown to the user as the
 * cursor. The PointerManager is reponsible for the actions taken. Yet their workings
 * are quite similiar. Maybe their function will be unified at some point.
 */
export class CursorManager {

  private readonly cursors = new Map<CursorType, Phaser.GameObjects.Image>();
  private activeCursor: Phaser.GameObjects.Image;

  private readonly pointerClickedOffset = new Px(-5, -5);
  private isClicked = false;

  constructor(
    private readonly ctx: EngineContext
  ) {
    PubSub.subscribe(EngineEvents.GAME_MOUSE_OUT, () => this.hide());
    PubSub.subscribe(EngineEvents.GAME_MOUSE_OVER, () => this.show());
    this.ctx.game.input.on('pointerdown', this.onPointerDown, this);
    this.ctx.game.input.on('pointerup', this.onPointerUp, this);
  }

  public setCursorSprite(cursorType: CursorType) {
    const newCursor = this.cursors.get(cursorType);
    if (!newCursor) {
      LOG.warn(`Unknown cursor type requested: ${cursorType}`);
    }
    const currentVisibility = this.activeCursor.visible;
    this.activeCursor.visible = false;
    this.activeCursor = newCursor;
    this.activeCursor.visible = currentVisibility;
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

    if (this.isClicked) {
      this.activeCursor.setPosition(
        pointerPos.x + this.pointerClickedOffset.x,
        pointerPos.y + this.pointerClickedOffset.y
      );
    } else {
      this.activeCursor.setPosition(pointerPos.x, pointerPos.y);
    }
  }

  public hide() {
    this.activeCursor.visible = false;
  }

  public show() {
    this.activeCursor.visible = true;
  }

  private onPointerDown() {
    this.isClicked = true;
  }

  private onPointerUp() {
    this.isClicked = false;
  }
}
