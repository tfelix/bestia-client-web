import { Entity, ChatAction } from 'app/game/entities';
import { Px } from 'app/game/model';

import { ActionsRenderer } from './ActionsRenderer';
import { EngineContext } from '../../EngineContext';

const CHAT_DISPLAY_DURATION_MS = 3500;
const SPRITE_Y_OFFSET = -10;
const CHAT_BORDER_PADDING = 4;

const CHAT_STYLE = {
  fontFamily: 'Arial',
  fontSize: 12,
  color: '#FFFFFF',
  boundsAlignH: 'center',
  boundsAlignV: 'middle'
};

export interface ChatData {
  background: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
  deleteTimer: Phaser.Time.TimerEvent;
}

const rect = new Phaser.Geom.Rectangle();

export class ChatActionsRenderer extends ActionsRenderer {

  constructor(
    private readonly ctx: EngineContext
  ) {
    super(ctx.game);
  }

  private updateChatPosition(entity: Entity) {
    const sprite = entity.data.visual && entity.data.visual.sprite;
    if (!sprite) {
      this.clearChatData(entity);
    }
    const chatData = entity.data.chat!!;
    const chatPos = this.calculateChatPosition(entity);
    chatData.text.setPosition(chatPos.x, chatPos.y);
    chatData.background.clear();
    this.drawChatBackground(chatData.background, chatData.text);
  }

  public needsUpdate(entity: Entity): boolean {
    return entity.hasAction(ChatAction) || !!entity.data.chat;
  }

  private calculateChatPosition(entity: Entity) {
    const entitySprite = entity.data.visual && entity.data.visual.sprite;
    if (!entitySprite) {
      return;
    }
    const spriteHeight = this.ctx.helper.sprite.getSpriteSize(entitySprite).height;
    return new Px(entitySprite.x, entitySprite.y - spriteHeight + SPRITE_Y_OFFSET);
  }

  public doUpdate(entity: Entity) {
    if (entity.data.chat) {
      this.updateChatPosition(entity);
      return;
    }

    const chatPos = this.calculateChatPosition(entity);
    const actions = this.getActionsFromEntity<ChatAction>(entity, ChatAction);
    // We only render the last one
    const action = actions.pop();

    const box = this.game.add.graphics();

    const chatMsg = (action.nickname) ? `${action.nickname}: ${action.text}` : action.text;
    const txt = this.game.add.text(
      chatPos.x,
      chatPos.y,
      chatMsg,
      CHAT_STYLE
    );
    txt.depth = 10000;
    txt.setOrigin(0.5, 0.5);

    const gfx = this.game.add.graphics();
    gfx.fillStyle(0x00AA00, 1);
    this.drawChatBackground(gfx, txt);

    // There seems to be a bug and the childs can not be added in the constructor.
    // Thats why they are added in an extra call.
    entity.data.chat = {
      background: gfx,
      text: txt,
      deleteTimer: this.game.time.addEvent({
        delay: CHAT_DISPLAY_DURATION_MS,
        callback: () => this.clearChatData(entity)
      })
    };
  }

  private drawChatBackground(gfx: Phaser.GameObjects.Graphics, txt: Phaser.GameObjects.Text) {
    const topleft = txt.getTopLeft();
    rect.setPosition(topleft.x - CHAT_BORDER_PADDING / 2, topleft.y - CHAT_BORDER_PADDING / 2);
    rect.width = txt.width + CHAT_BORDER_PADDING;
    rect.height = txt.height + CHAT_BORDER_PADDING;

    gfx.fillStyle(0x000000, 0.5);
    gfx.fillRectShape(rect);
  }

  private clearChatData(entity: Entity) {
    if (entity.data.chat) {
      entity.data.chat.deleteTimer.destroy();
      entity.data.chat.background.destroy();
      entity.data.chat.text.destroy();
      entity.data.chat = null;
    }
  }

  public getLastUpdateDetails(): [[string, number]] | null {
    return [['action:chat', this.getLastUpdateTimeMs()]];
  }
}
