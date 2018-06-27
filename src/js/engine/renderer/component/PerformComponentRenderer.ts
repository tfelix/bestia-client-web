import { ComponentRenderer } from '.';
import { ComponentType } from 'entities/components';
import { Entity } from 'entities';
import { EngineContext } from '../../EngineContext';
import { PerformComponent } from 'entities/components/PerformComponent';
import { Depths } from '../VisualDepths';
import { UIConstants } from 'ui';
import { Px } from 'model';

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
    super(ctx.game);

    if (!PerformComponentRenderer.graphicsLayer) {
      PerformComponentRenderer.graphicsLayer = this.game.add.graphics({ fillStyle: { color: 0x000000 } });
      PerformComponentRenderer.graphicsLayer.depth = Depths.UI;

      PerformComponentRenderer.cancelButton = this.game.add.image(0, 0, 'ui', UIConstants.CANCEL);
      PerformComponentRenderer.cancelButton.visible = false;
      PerformComponentRenderer.cancelButton.depth = Depths.UI;
    }
  }

  get supportedComponent(): ComponentType {
    return ComponentType.PERFORM;
  }

  protected update() {
    PerformComponentRenderer.graphicsLayer.clear();
  }

  protected hasNotSetup(entity: Entity, component: PerformComponent): boolean {
    return !entity.data.perform && this.ctx.playerHolder.isPlayerEntity(entity);
  }

  protected createGameData(entity: Entity, component: PerformComponent) {
    entity.data.perform = {
      endTime: this.game.time.now + component.duration - entity.latency,
      startTime: this.game.time.now
    };
    PerformComponentRenderer.cancelButton.visible = true;
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

  protected removeComponent(entity: Entity, component: PerformComponent) {
    PerformComponentRenderer.cancelButton.visible = false;
  }

  private drawPerformBar(entity: Entity, component: PerformComponent) {
    const sprite = entity.data.visual && entity.data.visual.sprite;
    if (!sprite) {
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
