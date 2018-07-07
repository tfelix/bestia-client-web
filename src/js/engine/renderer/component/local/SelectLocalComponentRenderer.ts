import { ComponentRenderer } from '../ComponentRenderer';
import { ComponentType, SelectLocalComponent, InteractionLocalComponent, InteractionType } from 'entities/components';
import { Entity } from 'entities';
import { EngineContext } from 'engine';
import { VisualDepth } from '../../VisualDepths';
import { UIConstants, UIAtlas } from 'ui';
import { ScaleModes } from 'phaser';

export class SelectLocalComponentRenderer extends ComponentRenderer<SelectLocalComponent> {

  private selectedEntityId = 0;
  private gfx: Phaser.GameObjects.Graphics;
  private circle = new Phaser.Geom.Circle(0, 0, 20);
  private iconCircle = new Phaser.Geom.Circle(0, 0, 60);
  private icons: Phaser.GameObjects.Image[] = [];

  constructor(
    private readonly ctx: EngineContext
  ) {
    super(ctx.game);

    this.gfx = ctx.game.add.graphics();
    this.gfx.lineStyle(20, 0xFF0000);
    this.gfx.depth = VisualDepth.MARKER;
  }

  // TODO Place at a better place since this logic might be needed elsewhere.
  private setupSpriteAsButton(visual: Phaser.GameObjects.Image) {
    visual.depth = VisualDepth.UI;
    visual.setInteractive();
    visual.setScaleMode(ScaleModes.LINEAR);
    visual.on('pointerover', () => {
      this.ctx.sound.rollover.play();
      visual.setScale(1.1);
    });
    visual.on('pointerout', () => {
      visual.setScale(1);
    });
    visual.on('pointerdown', () => {
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

    this.gfx.clear();
    const sprite = entity.data.visual && entity.data.visual.sprite;
    if (!sprite) {
      this.selectedEntityId = 0;
      return;
    }

    this.createMarker(sprite);
    this.createOptionsButtons(entity, sprite);

    this.selectedEntityId = entity.id;
  }

  private createMarker(sprite: Phaser.GameObjects.Sprite) {
    this.circle.x = sprite.x;
    this.circle.y = sprite.y;
    this.gfx.lineStyle(5, 0xFFFF00);
    this.gfx.strokeCircleShape(this.circle);
  }

  private createOptionsButtons(entity: Entity, sprite: Phaser.GameObjects.Sprite) {
    const interactComp = entity.getComponent(ComponentType.LOCAL_INTERACTION) as InteractionLocalComponent;
    if (!interactComp) {
      return;
    }

    const interactionNames = [];
    interactComp.possibleInteraction.forEach(inter => interactionNames.push(this.typeToIcon(inter)));
    this.icons = interactionNames.map(name => this.ctx.game.add.image(0, 0, UIAtlas, name));
    this.icons.forEach(s => this.setupSpriteAsButton(s));

    for (let i = 0; i < interactionNames.length; i++) {
      const angle = i / interactionNames.length * Phaser.Math.PI2;

      const xOffset = Math.cos(angle) * this.iconCircle.diameter;
      const yOffset = Math.sin(angle) * this.iconCircle.diameter;

      Phaser.Geom.Circle.Offset(this.iconCircle, xOffset, yOffset);

      this.icons[i].x = sprite.x + xOffset;
      this.icons[i].y = sprite.y + yOffset;
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
