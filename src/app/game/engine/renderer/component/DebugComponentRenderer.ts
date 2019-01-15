import { Entity, DebugComponent, Component, ComponentType, InteractionLocalComponent } from 'app/game/entities';

import { ComponentRenderer } from './ComponentRenderer';
import { VisualDepth } from '../VisualDepths';
import { MapHelper } from '../../MapHelper';
import { TextStyles } from '../../TextStyles';
import { SceneNames } from '../../scenes/SceneNames';

export interface DebugData {
  origin: Phaser.GameObjects.Graphics;
  debugText?: Phaser.GameObjects.Text;
}

export class DebugComponentRenderer extends ComponentRenderer<DebugComponent> {

  private readonly uiScene: Phaser.Scene;
  private readonly mainCamera: Phaser.Cameras.Scene2D.Camera;


  constructor(
    game: Phaser.Scene
  ) {
    super(game);

    this.mainCamera = game.cameras.main;
    this.uiScene = game.scene.get(SceneNames.UI);
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
    entity.data.debug.debugText = this.uiScene.add.text(
      sprite.x + 10,
      sprite.y - 32,
      '',
      TextStyles.DEBUG
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
    debugData.debugText.text = text;

    const localPos = MapHelper.worldPxToSceneLocal(this.mainCamera, sprite.x, sprite.y);
    debugData.debugText.setPosition(localPos.x + 10, localPos.y - 32);
    debugData.origin.setPosition(sprite.x, sprite.y);
  }
}
