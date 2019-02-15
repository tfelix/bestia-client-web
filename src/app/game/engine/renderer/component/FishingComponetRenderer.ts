import { sendToServer, UpdateComponentMessage, ComponentDeleteMessage } from 'app/game/message';
import { FishingComponent, ComponentType, Entity, PositionComponent } from 'app/game/entities';
import { Point, Px } from 'app/game/model';

import { ComponentRenderer } from './ComponentRenderer';
import { EngineContext } from '../../EngineContext';
import { MapHelper } from '../../MapHelper';
import { AtlasUIBase, UIConstants } from 'app/game/ui';
import { VisualDepth } from '../VisualDepths';
import { SceneNames } from '../../scenes/SceneNames';

export class FishingComponentRenderer extends ComponentRenderer<FishingComponent> {

  private readonly uiScene: Phaser.Scene;
  private readonly indicatorOffset = new Px(80, -180);
  private readonly fishlineMoveTickMs = 300;

  private lastFishlineMoveTick = 0;
  private fishingTarget: Phaser.Math.Vector2;

  private bubbles: Phaser.GameObjects.Particles.ParticleEmitterManager;
  private graphicsFishline: Phaser.GameObjects.Graphics;
  private hookArea: Phaser.GameObjects.Image;
  private hookZone: Phaser.GameObjects.Zone;
  private fishingMeter: Phaser.GameObjects.Image;
  private fishingSwimmer: Phaser.GameObjects.Sprite;
  private fishIcon: Phaser.GameObjects.Image;
  private fishingActionButton: Phaser.GameObjects.Image;
  private fishingCancelButton: Phaser.GameObjects.Image;
  private container: Phaser.GameObjects.Container;
  private hasSetup = false;

  constructor(
    private readonly ctx: EngineContext
  ) {
    super(ctx.gameScene);

    this.uiScene = ctx.gameScene.scene.get(SceneNames.UI);
  }

  protected hasNotSetup(entity: Entity, component: FishingComponent): boolean {
    return entity.hasComponent(ComponentType.FISHING) && !this.hasSetup;
  }

  get supportedComponent(): ComponentType {
    return ComponentType.FISHING;
  }

  protected createGameData(entity: Entity, component: FishingComponent) {
    const posComp = entity.getComponent(ComponentType.POSITION) as PositionComponent;
    if (!posComp) {
      return;
    }

    const centered = MapHelper.pointToPixelCentered(new Point(
      component.targetPoint.x,
      component.targetPoint.y
    ));
    this.fishingTarget = new Phaser.Math.Vector2(centered.x, centered.y);

    this.graphicsFishline = this.ctx.gameScene.add.graphics();
    this.fishingSwimmer = this.ctx.gameScene.add.sprite(
      this.fishingTarget.x,
      this.fishingTarget.y,
      UIConstants.FISHING_ANIM_SWIMMER
    );
    this.fishingSwimmer.anims.play(UIConstants.FISHING_ANIM_SWIMMER);

    const localPos = MapHelper.worldPxToSceneLocal(
      this.game.cameras.main,
      this.fishingTarget.x,
      this.fishingTarget.y
    );
    this.container = this.uiScene.add.container(
      localPos.x + this.indicatorOffset.x,
      localPos.y + this.indicatorOffset.y
    );

    this.fishingMeter = this.uiScene.add.image(
      0,
      0,
      AtlasUIBase,
      UIConstants.ICON_FISHING_METER
    );
    this.fishingMeter.depth = VisualDepth.UI_UNDER_CURSOR;
    this.container.add(this.fishingMeter);

    this.hookArea = this.uiScene.add.image(
      0,
      0,
      AtlasUIBase,
      UIConstants.FISHING_HOOK_AREA
    );
    this.container.add(this.hookArea);

    this.fishIcon = this.uiScene.physics.add.image(
      0,
      0,
      AtlasUIBase,
      UIConstants.ICON_FISHING
    );
    this.fishIcon.depth = VisualDepth.UI_UNDER_CURSOR;
    this.container.add(this.fishIcon);
    const fishBody = this.fishIcon.body as Phaser.Physics.Arcade.Body;
    fishBody.collideWorldBounds = false;
    fishBody.allowGravity = false;
    fishBody.setVelocityY(10);
    fishBody.setAccelerationY(35);
    fishBody.setMaxVelocity(0, 60);
    fishBody.setDragY(40);

    this.hookZone = this.uiScene.add.zone(
      0,
      0,
      100,
      82
    );
    this.container.add(this.hookZone);
    this.uiScene.physics.add.existing(this.hookZone);
    const hookZoneBody = this.hookZone.body as Phaser.Physics.Arcade.Body;
    hookZoneBody.setMaxVelocity(0, 80);
    hookZoneBody.setAccelerationY(50);
    hookZoneBody.setDragY(40);
    hookZoneBody.collideWorldBounds = false;
    hookZoneBody.allowGravity = false;

    // Setup the mask to hide any sprite leaving the fishing zone.
    const shape = this.uiScene.make.graphics({});
    shape.setPosition(0, 0);
    shape.fillStyle(0xffffff);
    shape.beginPath();
    // width and height of containers wont work properly yet. So we need the getBounds function
    // in order to get the proper size.
    const containerBounds = this.container.getBounds();
    shape.fillRect(
      containerBounds.x,
      containerBounds.y,
      containerBounds.width,
      containerBounds.height
    );
    this.container.mask = new Phaser.Display.Masks.GeometryMask(this.uiScene, shape);

    const bubblesLine = new Phaser.Geom.Line(-50, 150, 50, 150);
    this.bubbles = this.uiScene.add.particles(AtlasUIBase);
    this.bubbles.createEmitter({
      frame: [UIConstants.FISHING_BUBBLE],
      scale: { start: 0.8, end: 1.0 },
      angle: { min: 270, max: 280 },
      speed: { min: 20, max: 40 },
      lifespan: 14000,
      maxParticles: 30,
      frequency: 1000,
      emitZone: { type: 'random', source: bubblesLine, quantity: 50 }
    } as any);
    this.container.add(this.bubbles);

    this.fishingActionButton = this.uiScene.add.image(
      this.container.x + 90,
      this.container.y,
      AtlasUIBase,
      UIConstants.ICON_FISHING_BUTTON
    );
    this.fishingActionButton.setInteractive();
    this.fishingActionButton.on('pointerdown', () => this.onFishButtonClicked());
    this.fishingActionButton.setScale(2);
    this.fishingActionButton.depth = 0; // VisualDepth.UI_UNDER_CURSOR;

    this.fishingCancelButton = this.uiScene.add.image(
      this.container.x - 85,
      this.container.y,
      AtlasUIBase,
      UIConstants.CANCEL
    );
    this.fishingCancelButton.depth = VisualDepth.UI_UNDER_CURSOR;
    this.fishingCancelButton.setInteractive();
    this.fishingCancelButton.on('pointerdown', () => this.endFishing());

    this.lastFishlineMoveTick = this.ctx.gameScene.time.now;

    this.hasSetup = true;
  }

  public removeGameData(entity: Entity) {
    if (!this.hasSetup) {
      return;
    }

    this.hasSetup = false;

    this.fishIcon.destroy();
    this.fishIcon = null;

    this.fishingMeter.destroy();
    this.fishingMeter = null;

    this.graphicsFishline.destroy();
    this.graphicsFishline = null;

    this.hookArea.destroy();
    this.hookArea = null;

    this.hookZone.destroy();
    this.hookZone = null;

    this.fishingActionButton.destroy();
    this.fishingActionButton = null;

    this.fishingCancelButton.destroy();
    this.fishingCancelButton = null;

    this.fishingSwimmer.destroy();
    this.fishingSwimmer = null;

    this.bubbles.destroy();
  }

  private onFishButtonClicked() {
    const fishingComponent = this.ctx.playerHolder.activeEntity.getComponent(ComponentType.FISHING) as FishingComponent;
    if (!fishingComponent) {
      return;
    }

    fishingComponent.hasClickedFishingAction = true;
    const fishingZoneBody = this.hookZone.body as Phaser.Physics.Arcade.Body;
    fishingZoneBody.setVelocityY(-50);
  }

  protected updateGameData(entity: Entity, component: FishingComponent) {
    const hasFishingZoneOverlap = this.game.physics.overlap(this.hookZone, this.fishIcon);

    this.updateFishingHookPosition(component, hasFishingZoneOverlap);
    this.updateFishlineTargetPosition(entity, component);
    this.updateFishVelocity(hasFishingZoneOverlap);
    this.checkEndConditions(entity, component);
  }

  private checkEndConditions(entity: Entity, component: FishingComponent) {
    const relPosition = this.getPositionPercentageToIndicator(this.fishIcon.y);
    if (relPosition <= 0) {
      this.endFishing();
    }
    if (relPosition >= 1) {
      const updateMsg = new UpdateComponentMessage(component);
      sendToServer(updateMsg);
    }
  }

  private updateFishVelocity(hasFishingZoneOverlap: boolean) {
    if (!hasFishingZoneOverlap) {
      return;
    }

    const fishBody = this.fishIcon.body as Phaser.Physics.Arcade.Body;
    fishBody.setVelocityY(fishBody.velocity.y - 1);
  }

  private endFishing() {
    const fishingComp = this.ctx.playerHolder.activeEntity.getComponent(ComponentType.FISHING);
    this.ctx.playerHolder.activeEntity.removeComponentByType(ComponentType.FISHING);
    const msg = new ComponentDeleteMessage(fishingComp.entityId, fishingComp.type);
    sendToServer(msg);
  }

  private getPositionPercentageToIndicator(posY: number): number {
    const fishIndicatorHeight = this.fishingMeter.displayHeight;
    const originOffsetY = this.fishingMeter.originY * fishIndicatorHeight;
    const topY = this.fishingMeter.y - originOffsetY;
    const bottomY = topY + fishIndicatorHeight;
    const relPosY = Phaser.Math.Clamp(1 - (posY - topY) / (bottomY - topY), 0, 1);
    return relPosY;
  }

  private updateFishingHookPosition(component: FishingComponent, hasFishingZoneOverlap: boolean) {
    if (this.hookZone.y > 200) {
      this.hookZone.y = 200;
    }

    this.hookArea.setPosition(this.hookZone.x, this.hookZone.y);
  }

  private updateFishlineTargetPosition(entity: Entity, component: FishingComponent) {
    if (this.ctx.gameScene.time.now - this.lastFishlineMoveTick < this.fishlineMoveTickMs) {
      return;
    }

    this.graphicsFishline.clear();
    const posComp = entity.getComponent(ComponentType.POSITION) as PositionComponent;
    if (!posComp) {
      return;
    }

    const offset = Phaser.Math.RandomXY(new Phaser.Math.Vector2(1, 1));
    this.fishingTarget = offset.add(this.fishingTarget);

    const entityPx = MapHelper.pointToPixelCentered(posComp.position);
    this.fishingSwimmer.setPosition(this.fishingTarget.x, this.fishingTarget.y);
    this.graphicsFishline.lineStyle(1, 0xffffff, 1);
    this.graphicsFishline.lineBetween(entityPx.x + 10, entityPx.y - 30, this.fishingTarget.x, this.fishingTarget.y);

    this.lastFishlineMoveTick = this.ctx.gameScene.time.now;
  }
}
