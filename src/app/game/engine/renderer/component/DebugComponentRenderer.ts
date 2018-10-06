import { Entity, DebugComponent, Component, ComponentType, InteractionLocalComponent } from 'app/game/entities';
import { MapHelper } from 'app/game/map';

import { ComponentRenderer } from './ComponentRenderer';
import { VisualDepth } from '../VisualDepths';

export interface DebugData {
  origin: Phaser.GameObjects.Graphics;
  debugText?: Phaser.GameObjects.Text;
}

export class DebugComponentRenderer extends ComponentRenderer<DebugComponent> {

  constructor(
    game: Phaser.Scene
  ) {
    super(game);
  }

  get supportedComponent(): ComponentType {
    return ComponentType.DEBUG;
  }

  protected hasNotSetup(entity: Entity, component: DebugComponent): boolean {
    return !entity.data.debug;
  }

  protected createGameData(entity: Entity, component: DebugComponent) {
    if (!entity.data.visual) {
      return;
    }

    const originCircle = new Phaser.Geom.Circle(0, 0, 5);
    const originCircleGraphics = this.game.add.graphics();
    originCircleGraphics.fillStyle(0xFF0000, 1);
    originCircleGraphics.fillCircleShape(originCircle);

    entity.data.debug = {
      origin: originCircleGraphics
    };

    const sprite = entity.data.visual.sprite;
    this.alignGraphics(entity.data.debug, sprite, entity);
  }

  protected updateGameData(entity: Entity, component: DebugComponent) {
    const sprite = entity.data.visual.sprite;
    const graphics = entity.data.debug;
    this.alignGraphics(graphics, sprite, entity);
  }

  protected removeComponent(entity: Entity, component: Component) {
  }

  private alignGraphics(graphics: DebugData, sprite: Phaser.GameObjects.Sprite, entity: Entity) {
    if (!sprite || !graphics) {
      return;
    }

    if (graphics.debugText) {
      graphics.debugText.destroy();
    }

    const entityId = sprite.getData('entity_id') || '?';
    const pos = MapHelper.pixelToPoint(sprite.x, sprite.y);
    let text = `eid: ${entityId}  z: ${Math.floor(sprite.depth)}\nx: ${pos.x} y: ${pos.y}\n`;
    const interactionComp = entity.getComponent(ComponentType.LOCAL_INTERACTION) as InteractionLocalComponent;
    if (interactionComp) {
      text += `Inter: ${interactionComp.activeInteraction}, pos: ${JSON.stringify(interactionComp.possibleInteractions)}\n`;
    }
    graphics.debugText = this.game.add.text(
      sprite.x + 10,
      sprite.y - 32,
      text
    );
    graphics.debugText.depth = VisualDepth.UI;
    graphics.origin.setPosition(sprite.x, sprite.y);
  }
}
