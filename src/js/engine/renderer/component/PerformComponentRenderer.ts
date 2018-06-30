import { ComponentType } from 'entities/components';
import { Entity } from 'entities';
import { Px } from 'model';
import { AbortPerformMessage } from 'message';
import { Topics } from 'Topics';
import { UIConstants } from 'ui';

import { ComponentRenderer } from '.';
import { EngineContext } from '../../EngineContext';
import { PerformComponent } from 'entities/components/PerformComponent';
import { Depths } from '../VisualDepths';
import { SoundHolder } from '../../SoundHolder';

export interface PerformData {
  endTime: number;
  startTime: number;
}

const BAR_TOP_OFFSET = 4;
const BAR_HEIGHT = 6;
const rect = new Phaser.Geom.Rectangle();

export class PerformComponentRenderer extends ComponentRenderer<PerformComponent> {

  private static graphicsLayer: Phaser.GameObjects.Graphics;
  private static cancelButton: Phaser.GameObjects.Image;
  private static cancelButtonOffset = new Px(-40, 15);

  private soundHolder = SoundHolder;

  constructor(
    private readonly ctx: EngineContext
  ) {
    super(ctx.game);

    if (!PerformComponentRenderer.graphicsLayer) {
      PerformComponentRenderer.graphicsLayer = this.game.add.graphics({ fillStyle: { color: 0x000000 } });
      PerformComponentRenderer.graphicsLayer.depth = Depths.UI;

      this.soundHolder.buttonClick = this.game.sound.add('click', { loop: false });
      PerformComponentRenderer.cancelButton = this.game.add.image(0, 0, 'ui', UIConstants.CANCEL);

      PerformComponentRenderer.cancelButton.visible = false;
      PerformComponentRenderer.cancelButton.depth = Depths.UI;
      PerformComponentRenderer.cancelButton.setInteractive();
      PerformComponentRenderer.cancelButton.on('pointerout', () => this.ctx.pointerManager.show());
      PerformComponentRenderer.cancelButton.on('pointerover', () => this.ctx.pointerManager.hide());
      PerformComponentRenderer.cancelButton.on('pointerdown', () => this.abortPerform());
    }
  }

  get supportedComponent(): ComponentType {
    return ComponentType.PERFORM;
  }

  private abortPerform() {
    this.soundHolder.buttonClick.play();
    const abortMsg = new AbortPerformMessage();
    PubSub.publish(Topics.IO_SEND_MSG, abortMsg);
  }

  protected update() {
    PerformComponentRenderer.graphicsLayer.clear();
  }

  protected hasNotSetup(entity: Entity, component: PerformComponent): boolean {
    return !entity.data.perform && this.ctx.playerHolder.isActivePlayerEntity(entity);
  }

  protected createGameData(entity: Entity, component: PerformComponent) {
    entity.data.perform = {
      endTime: this.game.time.now + component.duration - entity.latency,
      startTime: this.game.time.now
    };
    if (component.canAbort) {
      PerformComponentRenderer.cancelButton.visible = true;
    }
  }

  protected updateGameData(entity: Entity, component: PerformComponent) {
    this.drawPerformBar(entity, component);
    this.updateCancelButton(entity);
  }

  private updateCancelButton(entity: Entity) {
    const pxPos = this.getEntityPxPos(entity);
    PerformComponentRenderer.cancelButton.setPosition(
      pxPos.x + PerformComponentRenderer.cancelButtonOffset.x,
      pxPos.y + PerformComponentRenderer.cancelButtonOffset.y
    );
  }

  public removeGameData(entity: Entity) {
    PerformComponentRenderer.graphicsLayer.clear();
    PerformComponentRenderer.cancelButton.visible = false;
  }

  private drawPerformBar(entity: Entity, component: PerformComponent) {
    const sprite = entity.data.visual && entity.data.visual.sprite;
    // If this is not the player entity we might not have the perform data setup
    // so we must not draw the renderer.
    if (!sprite || !entity.data.perform) {
      return;
    }

    const gfx = PerformComponentRenderer.graphicsLayer;
    const spriteSize = this.ctx.helper.sprite.getSpriteSize(sprite);

    const delta = entity.data.perform.endTime - entity.data.perform.startTime;
    const passed = this.game.time.now - entity.data.perform.startTime;
    const performPerc = Math.max(0, passed / delta);
    if (performPerc > 1) {
      return;
    }

    rect.height = BAR_HEIGHT;
    rect.x = sprite.x - spriteSize.width / 2;
    rect.y = sprite.y - spriteSize.height - BAR_TOP_OFFSET;
    rect.width = spriteSize.width;

    // Draw background
    gfx.fillStyle(0x000000, 0.8);
    gfx.fillRectShape(rect);

    // Draw progress
    gfx.fillStyle(0xF3F3F3);
    rect.x += 1;
    rect.y += 1;
    rect.width -= 2;
    rect.width *= performPerc;
    rect.height -= 2;
    gfx.fillRectShape(rect);
  }
}
