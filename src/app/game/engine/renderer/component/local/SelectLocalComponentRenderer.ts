import * as LOG from 'loglevel';

import { UIConstants, UIAtlasBase } from 'app/game/ui';
import {
  Entity, ComponentType, SelectLocalComponent, InteractionLocalComponent, InteractionType
} from 'app/game/entities';

import { ComponentRenderer } from '../ComponentRenderer';
import { EngineContext } from '../../..';
import { VisualDepth } from '../../VisualDepths';
import { SceneNames } from '../../../scenes/SceneNames';

export class SelectLocalComponentRenderer extends ComponentRenderer<SelectLocalComponent> {

  private selectedEntityId = 0;

  private guiScene: Phaser.Scene;
  private gfx: Phaser.GameObjects.Graphics;
  private circle = new Phaser.Geom.Circle(0, 0, 20);
  private iconCircle = new Phaser.Geom.Circle(0, 0, 40);

  private icons: Phaser.GameObjects.Image[] = [];
  private iconsContainer: Phaser.GameObjects.Container;

  constructor(
    private readonly ctx: EngineContext
  ) {
    super(ctx.game);

    this.guiScene = ctx.game.scene.get(SceneNames.UI_DIALOG);

    this.gfx = this.game.add.graphics();
    this.gfx.lineStyle(20, 0xFF0000);
    this.gfx.depth = VisualDepth.MARKER;
  }

  private setupSpriteAsButton(visual: Phaser.GameObjects.Image) {
    visual.depth = VisualDepth.UI_UNDER_CURSOR;
    visual.setInteractive();
    visual.setScaleMode(Phaser.ScaleModes.LINEAR);
    visual.on('pointerover', () => {
      this.ctx.sound.rollover.play();
      visual.setScale(1.1);
    });
    visual.on('pointerout', () => {
      visual.setScale(1);
    });
  }

  public get supportedComponent(): ComponentType {
    return ComponentType.LOCAL_SELECT;
  }

  protected hasNotSetup(entity: Entity, component: SelectLocalComponent): boolean {
    return this.selectedEntityId !== entity.id;
  }

  protected createGameData(entity: Entity, component: SelectLocalComponent) {
    if (entity.id !== this.selectedEntityId) {
      this.clearSelection();
    }

    const sprite = entity.data.visual && entity.data.visual.sprite;
    if (!sprite) {
      this.selectedEntityId = 0;
      return;
    }

    this.createOptionsButtons(entity, sprite);

    this.selectedEntityId = entity.id;
  }

  private createMarker(sprite: Phaser.GameObjects.Sprite) {
    this.circle.x = sprite.x;
    this.circle.y = sprite.y;
    this.gfx.lineStyle(5, 0xFFFF00);
    this.gfx.strokeCircleShape(this.circle);
  }

  private setDefaultInteraction(entity: Entity, interaction: InteractionType) {
    const interactComp = entity.getComponent(ComponentType.LOCAL_INTERACTION) as InteractionLocalComponent;
    if (!interactComp) {
      return;
    }
    interactComp.activeInteraction = interaction;
    LOG.debug(`Set ${interaction} as default for entity ${entity.id}`);
  }

  private isDefaultInteraction(entity: Entity, interaction: InteractionType): boolean {
    const interactComp = entity.getComponent(ComponentType.LOCAL_INTERACTION) as InteractionLocalComponent;
    if (!interactComp) {
      return false;
    }
    return interactComp.activeInteraction === interaction;
  }

  private createOptionsButtons(entity: Entity, sprite: Phaser.GameObjects.Sprite) {
    const interactComp = entity.getComponent(ComponentType.LOCAL_INTERACTION) as InteractionLocalComponent;
    if (!interactComp) {
      return;
    }

    // TODO This solution is a bit clunky. If you have some better idea/style
    // refactor it.
    const interactionNames = [];
    for (const interaction of interactComp.possibleInteractions) {
      interactionNames.push({
        interaction: interaction,
        interactionIconName: this.typeToIcon(interaction)
      });
    }
    this.icons = interactionNames.map(v => this.guiScene.add.image(0, 0, UIAtlasBase, v.interactionIconName));
    this.icons.forEach((s, i) => {
      const interactionType = interactionNames[i].interaction;
      if (this.isDefaultInteraction(entity, interactionType)) {
        s.setTint(0xDCFB12);
      }

      this.setupSpriteAsButton(s);
      s.on('pointerup', () => {
        // TODO Refactor this as an own function.
        const defaultInteraction = interactionNames[i].interaction;
        this.setDefaultInteraction(entity, defaultInteraction);
        this.ctx.sound.buttonClick.play();
        entity.removeComponentByType(ComponentType.LOCAL_SELECT);
        this.clearSelection();
      });
    });

    this.positionIcons(sprite);
  }

  private positionIcons(sprite: Phaser.GameObjects.Sprite) {
    const scrollOffset = this.ctx.helper.display.getScrollOffsetPx();

    for (let i = 0; i < this.icons.length; i++) {
      const angle = i * Phaser.Math.PI2 / 6;

      const xOffset = Math.cos(angle) * this.iconCircle.diameter;
      const yOffset = Math.sin(angle) * this.iconCircle.diameter;

      Phaser.Geom.Circle.Offset(this.iconCircle, xOffset, yOffset);

      this.icons[i].x = sprite.x + xOffset - scrollOffset.x;
      this.icons[i].y = sprite.y + yOffset - scrollOffset.y;
    }
  }

  private typeToIcon(inter: InteractionType): string {
    switch (inter) {
      case InteractionType.ATTACK:
        return UIConstants.ICON_ATTACK;
      case InteractionType.FISH:
        return UIConstants.ICON_FISHING;
      case InteractionType.LOOT:
        return UIConstants.ICON_LOOT;
      case InteractionType.READ:
        return UIConstants.ICON_READ;
      case InteractionType.SPEAK:
        return UIConstants.ICON_TALK;
      default:
        return '';
    }
  }

  protected updateGameData(entity: Entity, component: SelectLocalComponent) {
    const sprite = entity.data.visual && entity.data.visual.sprite;
    this.gfx.clear();
    this.createMarker(sprite);
    this.positionIcons(sprite);
  }

  private clearSelection() {
    this.icons.forEach(i => i.destroy());
    this.selectedEntityId = 0;
    this.icons = [];
    this.gfx.clear();
  }

  public removeGameData(entity: Entity) {
    this.clearSelection();
  }
}
