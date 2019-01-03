import { Entity, DebugComponent, Component, ComponentType, InteractionLocalComponent } from 'app/game/entities';

import { ComponentRenderer } from './ComponentRenderer';
import { VisualDepth } from '../VisualDepths';
import { MapHelper } from '../../MapHelper';
import { t } from '@angular/core/src/render3';

export interface DebugData {
  origin: Phaser.GameObjects.Graphics;
  debugText?: Phaser.GameObjects.Text;
}

const debugTextStyle = {
  fontFamily: 'Verdana',
  fontSize: 8
};

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
    entity.data.debug.debugText = this.game.add.text(
      sprite.x + 10,
      sprite.y - 32,
      '',
      debugTextStyle
    );
    entity.data.debug.debugText.depth = VisualDepth.UI;

    this.alignGraphics(entity.data.debug, sprite, entity);
  }

  protected updateGameData(entity: Entity, component: DebugComponent) {
    const sprite = entity.data.visual.sprite;
    const graphics = entity.data.debug;

    this.alignGraphics(graphics, sprite, entity);
  }

  protected removeComponent(entity: Entity, component: Component) {
  }

  private alignGraphics(debugData: DebugData, sprite: Phaser.GameObjects.Sprite, entity: Entity) {
    if (!sprite || !debugData) {
      return;
    }

    const entityId = sprite.getData('entity_id') || '?';
    const pos = MapHelper.pixelToPoint(sprite.x, sprite.y);
    let text = `eid: ${entityId}  z: ${Math.floor(sprite.depth)}\nx: ${pos.x} y: ${pos.y}\n`;

    const interactionComp = entity.getComponent(ComponentType.LOCAL_INTERACTION) as InteractionLocalComponent;
    if (interactionComp) {
      text += `a.Inter:: ${interactionComp.activeInteraction}, pos.Inter.: ${JSON.stringify(interactionComp.possibleInteractions)}\n`;
    }
    debugData.debugText.setPosition(sprite.x + 10, sprite.y - 32);
    debugData.debugText.text = text;
    debugData.origin.setPosition(sprite.x, sprite.y);
  }
}
