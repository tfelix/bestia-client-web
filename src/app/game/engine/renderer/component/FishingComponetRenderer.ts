import { ComponentRenderer } from './ComponentRenderer';
import { FishingComponent, ComponentType, Entity, PositionComponent } from 'app/game/entities';
import { EngineContext } from '../../EngineContext';
import { MapHelper } from '../../MapHelper';
import { Point, Px } from 'app/game/model';
import { UIAtlasBase, UIConstants } from 'app/game/ui';
import { sendToServer, UpdateComponentMessage, ComponentDeleteMessage } from 'app/game/message';
import { VisualDepth } from '../VisualDepths';

export class FishingComponentRenderer extends ComponentRenderer<FishingComponent> {

  private readonly indicatorOffset = new Px(80, -180);
  private readonly fishlineMoveTickMs = 300;

  private lastFishlineMoveTick = 0;
  private fishingTarget: Phaser.Math.Vector2;

  private graphicsFishline: Phaser.GameObjects.Graphics;
  private hookArea: Phaser.GameObjects.Image;
  private hookZone: Phaser.GameObjects.Zone;
  private fishingMeter: Phaser.GameObjects.Image;
  private fishingSwimmer: Phaser.GameObjects.Sprite;
  private fishIcon: Phaser.GameObjects.Image;
  private fishingActionButton: Phaser.GameObjects.Image;
  private fishingCancelButton: Phaser.GameObjects.Image;
  private hasSetup = false;

  constructor(
    private readonly ctx: EngineContext
  ) {
    super(ctx.game);
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

    this.fishingActionButton = this.ctx.game.add.image(
      this.fishingTarget.x + this.indicatorOffset.x + 80,
      this.fishingTarget.y + this.indicatorOffset.y,
      UIAtlasBase,
      UIConstants.ICON_FISHING_BUTTON
    );
    this.fishingActionButton.setInteractive();
    this.fishingActionButton.on('pointerdown', () => this.onFishButtonClicked());
    this.fishingActionButton.setScale(2);
    this.fishingActionButton.depth = VisualDepth.UI_UNDER_CURSOR;

    this.fishingCancelButton = this.ctx.game.add.image(
      this.fishingTarget.x + this.indicatorOffset.x - 80,
      this.fishingTarget.y + this.indicatorOffset.y,
      UIAtlasBase,
      UIConstants.CANCEL
    );
    this.fishingCancelButton.depth = VisualDepth.UI_UNDER_CURSOR;
    this.fishingCancelButton.setInteractive();
    this.fishingCancelButton.on('pointerdown', () => this.endFishing());

    this.graphicsFishline = this.ctx.game.add.graphics();
    this.fishingSwimmer = this.ctx.game.add.sprite(
      this.fishingTarget.x,
      this.fishingTarget.y,
      UIConstants.FISHING_ANIM_SWIMMER
    );
    this.fishingSwimmer.anims.play(UIConstants.FISHING_ANIM_SWIMMER);

    this.hookArea = this.ctx.game.add.image(this.fishingTarget.x, this.fishingTarget.y, UIAtlasBase, UIConstants.FISHING_HOOK_AREA);
    this.hookArea.depth = VisualDepth.UI_UNDER_CURSOR + 1;

    this.fishingMeter = this.ctx.game.add.image(
      this.fishingTarget.x + this.indicatorOffset.x,
      this.fishingTarget.y + this.indicatorOffset.y,
      UIAtlasBase,
      UIConstants.ICON_FISHING_METER
    );
    this.fishingMeter.depth = VisualDepth.UI_UNDER_CURSOR;

    this.fishIcon = this.ctx.game.physics.add.image(
      this.fishingTarget.x + this.indicatorOffset.x,
      this.fishingTarget.y + this.indicatorOffset.y,
      UIAtlasBase,
      UIConstants.ICON_FISHING
    );
    this.fishIcon.setOrigin(0.5);
    this.fishIcon.depth = VisualDepth.UI_UNDER_CURSOR;
    const fishBody = this.fishIcon.body as Phaser.Physics.Arcade.Body;
    fishBody.collideWorldBounds = false;
    fishBody.allowGravity = false;
    fishBody.height = 32;
    fishBody.offset.x = 16;
    // fishBody.setVelocityY(10);
    // fishBody.setAccelerationY(35);
    fishBody.setMaxVelocity(0, 60);
    fishBody.setDragY(30);

    this.hookZone = this.ctx.game.add.zone(
      this.fishingTarget.x,
      this.fishingTarget.y - 100,
      50,
      50
    );
    this.hookZone.setOrigin(0, 0);
    this.game.physics.add.existing(this.hookZone);
    const hookZoneBody = this.hookZone.body as Phaser.Physics.Arcade.Body;
    hookZoneBody.setMaxVelocity(0, 80);
    hookZoneBody.setAccelerationY(50);
    hookZoneBody.setDragY(20);
    hookZoneBody.collideWorldBounds = false;
    hookZoneBody.allowGravity = false;

    // this.game.physics.add.overlap(this.fishingZone, this.fishIcon, this.onFishInZone, null, this);
    this.lastFishlineMoveTick = this.ctx.game.time.now;

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
    fishBody.setVelocityY(fishBody.velocity.y - 3);
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
    this.hookArea.setPosition(this.hookZone.x, this.hookZone.y);
    this.hookArea.width = this.hookZone.width;
    this.hookArea.height = this.hookZone.height;
  }

  private updateFishlineTargetPosition(entity: Entity, component: FishingComponent) {
    if (this.ctx.game.time.now - this.lastFishlineMoveTick < this.fishlineMoveTickMs) {
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

    this.lastFishlineMoveTick = this.ctx.game.time.now;
  }
}
