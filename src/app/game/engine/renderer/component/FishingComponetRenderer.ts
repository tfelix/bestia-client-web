import { ComponentRenderer } from './ComponentRenderer';
import { FishingComponent, ComponentType, Entity, PositionComponent } from 'app/game/entities';
import { EngineContext } from '../../EngineContext';
import { MapHelper } from '../../MapHelper';
import { Point, Px } from 'app/game/model';
import { UIAtlas, UIConstants } from 'app/game/ui';

export class FishingComponentRenderer extends ComponentRenderer<FishingComponent> {

  private readonly indicatorOffset = new Px(20, -120);
  private readonly fishlineMoveTickMs = 300;

  private lastFishlineMoveTick = 0;
  private fishingTarget: Phaser.Math.Vector2;
  private fishingArea: Phaser.Geom.Rectangle;

  private graphicsFishline: Phaser.GameObjects.Graphics;
  private graphicsArea: Phaser.GameObjects.Graphics;
  private fishingIndicator: Phaser.GameObjects.Image;
  private fishingIcon: Phaser.GameObjects.Image;
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

    this.graphicsFishline = this.ctx.game.add.graphics();
    this.graphicsArea = this.ctx.game.add.graphics();

    this.fishingIndicator = this.ctx.game.add.image(
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
    const arcadeBody = this.fishingIcon.body as Phaser.Physics.Arcade.Body;
    arcadeBody.collideWorldBounds = false;
    arcadeBody.setGravityY(50);

    this.fishingArea = new Phaser.Geom.Rectangle(
      this.fishingTarget.x,
      this.fishingTarget.y,
      50,
      50
    );

    // UPON ACTIVATION WE MUST REQUEST THE FISHING POINTER

    this.hasSetup = true;
  }

  public removeGameData(entity: Entity) {
    this.hasSetup = false;
    this.fishingIcon.destroy();
    this.fishingIcon = null;
    this.fishingIndicator.destroy();
    this.fishingIndicator = null;

    this.graphicsFishline.destroy();
    this.graphicsFishline = null;
    this.graphicsArea.destroy();
    this.graphicsArea = null;
  }

  protected updateGameData(entity: Entity, component: FishingComponent) {
    this.updateFishingRectPosition();
    this.updateFishlineTargetPosition(entity, component);
    this.updateFishVelocity();

    this.checkEndConditions();
  }

  private checkEndConditions() {
    // TODO End the game and send data to the server.
  }

  private updateFishVelocity() {

  }

  private getFishYPositionPercentage() {
    const fishIndicatorHeight = this.fishingIndicator.displayHeight;
    const fishY = this.fishingIcon.y;
  }

  private updateFishingRectPosition() {
    this.graphicsArea.fillStyle(0xff0000);
    this.graphicsArea.fillRectShape(this.fishingArea);
  }

  private updateFishlineTargetPosition(entity: Entity, component: FishingComponent) {
    if (this.ctx.game.time.now - this.lastFishlineMoveTick > this.fishlineMoveTickMs) {
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
