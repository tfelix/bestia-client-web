import { ComponentRenderer } from './ComponentRenderer';
import { FishingComponent, ComponentType, Entity, PositionComponent } from 'app/game/entities';
import { EngineContext } from '../../EngineContext';
import { MapHelper } from '../../MapHelper';
import { Point, Px } from 'app/game/model';
import { UIAtlas, UIConstants } from 'app/game/ui';
import { sendToServer, UpdateComponentMessage } from 'app/game/message';
import { VisualDepth } from '../VisualDepths';

export class FishingComponentRenderer extends ComponentRenderer<FishingComponent> {

  private readonly indicatorOffset = new Px(20, -120);
  private readonly fishlineMoveTickMs = 300;

  private lastFishlineMoveTick = 0;
  private fishingTarget: Phaser.Math.Vector2;
  private fishingArea: Phaser.Geom.Rectangle;

  private graphicsFishline: Phaser.GameObjects.Graphics;
  private graphicsArea: Phaser.GameObjects.Graphics;
  private fishingMeter: Phaser.GameObjects.Image;
  private fishingIcon: Phaser.GameObjects.Image;
  private fishingZone: Phaser.GameObjects.Zone;
  private fishingActionIcon: Phaser.GameObjects.Image;
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

    this.fishingActionIcon = this.ctx.game.add.image(
      this.fishingTarget.x + this.indicatorOffset.x + 80,
      this.fishingTarget.y + this.indicatorOffset.y,
      UIAtlas,
      UIConstants.ICON_FISHING_BUTTON
    );
    this.fishingActionIcon.setScale(2);
    this.fishingActionIcon.depth = VisualDepth.UI_LOWER;

    this.graphicsFishline = this.ctx.game.add.graphics();
    this.graphicsArea = this.ctx.game.add.graphics();
    this.graphicsArea.depth = VisualDepth.UI_LOWER;

    this.fishingMeter = this.ctx.game.add.image(
      this.fishingTarget.x + this.indicatorOffset.x,
      this.fishingTarget.y + this.indicatorOffset.y,
      UIAtlas,
      UIConstants.ICON_FISHING_METER
    );

    this.fishingIcon = this.ctx.game.physics.add.image(
      this.fishingTarget.x + this.indicatorOffset.x,
      this.fishingTarget.y + this.indicatorOffset.y,
      UIAtlas,
      UIConstants.ICON_FISHING
    );
    this.fishingIcon.setOrigin(0.5);
    this.fishingIcon.depth = VisualDepth.UI_LOWER;
    const arcadeBody = this.fishingIcon.body as Phaser.Physics.Arcade.Body;
    arcadeBody.collideWorldBounds = false;
    arcadeBody.allowGravity = false;
    arcadeBody.height = 32;
    arcadeBody.offset.x = 16;
    arcadeBody.setVelocityY(10);

    this.fishingArea = new Phaser.Geom.Rectangle(
      this.fishingTarget.x,
      this.fishingTarget.y,
      80,
      80
    );

    this.fishingZone = this.ctx.game.add.zone(
      this.fishingTarget.x,
      this.fishingTarget.y,
      50,
      50
    );
    this.fishingZone.setOrigin(0, 0);
    this.game.physics.add.existing(this.fishingZone);
    const arcadeAreaBody = this.fishingZone.body as Phaser.Physics.Arcade.Body;
    arcadeAreaBody.collideWorldBounds = false;
    arcadeAreaBody.allowGravity = false;
    arcadeAreaBody.setVelocityY(15);

    this.game.physics.add.overlap(this.fishingZone, this.fishingIcon, this.onFishInZone, null, this);

    this.lastFishlineMoveTick = this.ctx.game.time.now;

    this.hasSetup = true;
  }

  public removeGameData(entity: Entity) {
    this.hasSetup = false;

    this.fishingIcon.destroy();
    this.fishingIcon = null;

    this.fishingMeter.destroy();
    this.fishingMeter = null;

    this.graphicsFishline.destroy();
    this.graphicsFishline = null;

    this.graphicsArea.destroy();
    this.graphicsArea = null;

    this.fishingZone.destroy();
    this.fishingZone = null;

    this.fishingActionIcon.destroy();
    this.fishingActionIcon = null;
  }

  protected updateGameData(entity: Entity, component: FishingComponent) {
    this.updateFishingRectPosition(component);

    this.updateFishlineTargetPosition(entity, component);

    this.updateFishVelocity();

    this.checkEndConditions(entity, component);
  }

  private checkEndConditions(entity: Entity, component: FishingComponent) {
    const relPosition = this.getPositionPercentageToIndicator(this.fishingIcon.y);
    if (relPosition <= 0) {
      entity.removeComponentByType(ComponentType.FISHING);
    }
    if (relPosition >= 1) {
      const updateMsg = new UpdateComponentMessage(component);
      sendToServer(updateMsg);
    }
  }

  private updateFishVelocity() {

  }

  private onFishInZone() {
    this.fishingIcon.y -= 5;
  }

  private getPositionPercentageToIndicator(posY: number): number {
    const fishIndicatorHeight = this.fishingMeter.displayHeight;
    const originOffsetY = this.fishingMeter.originY * fishIndicatorHeight;
    const topY = this.fishingMeter.y - originOffsetY;
    const bottomY = topY + fishIndicatorHeight;
    const relPosY = Phaser.Math.Clamp(1 - (posY - topY) / (bottomY - topY), 0, 1);
    return relPosY;
  }

  private updateFishingRectPosition(component: FishingComponent) {
    if (component.hasClickedFishingAction) {
      component.hasClickedFishingAction = false;
      this.fishingZone.y = this.fishingZone.y - 10;
    }

    this.graphicsArea.clear();
    this.fishingArea.setPosition(this.fishingZone.x, this.fishingZone.y);
    this.fishingArea.width = this.fishingZone.width;
    this.fishingArea.height = this.fishingZone.height;
    this.graphicsArea.fillStyle(0xff0000);
    this.graphicsArea.fillRectShape(this.fishingArea);
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
    this.graphicsFishline.strokeCircle(this.fishingTarget.x, this.fishingTarget.y, 5);
    this.graphicsFishline.lineStyle(1, 0xffffff, 1);
    this.graphicsFishline.lineBetween(entityPx.x + 10, entityPx.y - 30, this.fishingTarget.x, this.fishingTarget.y);

    this.lastFishlineMoveTick = this.ctx.game.time.now;
  }
}
