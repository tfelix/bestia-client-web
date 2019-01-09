import { Entity, ComponentType, PerformComponent, LatencyComponent } from 'app/game/entities';
import { Px } from 'app/game/model';
import { AbortPerformMessage, EngineEvents } from 'app/game/message';
import { UIConstants, UIAtlasBase } from 'app/game/ui';

import { ComponentRenderer } from './ComponentRenderer';
import { EngineContext } from '../../EngineContext';
import { VisualDepth } from '../VisualDepths';

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

  constructor(
    private readonly ctx: EngineContext
  ) {
    super(ctx.gameScene);

    if (!PerformComponentRenderer.graphicsLayer) {
      PerformComponentRenderer.graphicsLayer = this.game.add.graphics();
      PerformComponentRenderer.graphicsLayer.fillStyle(0x000000, 1);
      PerformComponentRenderer.graphicsLayer.depth = VisualDepth.UI;

      PerformComponentRenderer.cancelButton = this.game.add.image(0, 0, UIAtlasBase, UIConstants.CANCEL);

      PerformComponentRenderer.cancelButton.visible = false;
      PerformComponentRenderer.cancelButton.depth = VisualDepth.UI;
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
    this.ctx.sound.buttonClick.play();
    const abortMsg = new AbortPerformMessage();
    PubSub.publish(EngineEvents.IO_SEND_MSG, abortMsg);
  }

  protected update() {
    PerformComponentRenderer.graphicsLayer.clear();
  }

  protected hasNotSetup(entity: Entity, component: PerformComponent): boolean {
    return !entity.data.perform && this.ctx.playerHolder.isActivePlayerEntity(entity);
  }

  protected createGameData(entity: Entity, component: PerformComponent) {
    const latencyComp = entity.getComponent(ComponentType.LATENCY) as LatencyComponent;
    const entityLatencyMs = latencyComp && latencyComp.latencyMs || 0;

    entity.data.perform = {
      endTime: this.game.time.now + component.duration - entityLatencyMs,
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
