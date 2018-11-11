import { ComponentRenderer } from './ComponentRenderer';
import { FishingComponent, ComponentType, Entity, PositionComponent } from 'app/game/entities';
import { EngineContext } from '../../EngineContext';
import { MapHelper } from '../../MapHelper';
import { Point } from 'app/game/model';

export class FishingComponentRenderer extends ComponentRenderer<FishingComponent> {

  // TODO Replace this by an animated sprite
  private fishingGraphics: Phaser.GameObjects.Graphics;
  private hasSetup = false;

  constructor(
    private readonly ctx: EngineContext
  ) {
    super(ctx.game);
  }

  public create() {
    this.fishingGraphics = this.ctx.game.add.graphics();
  }

  protected hasNotSetup(entity: Entity, component: FishingComponent): boolean {
    return entity.hasComponent(ComponentType.FISHING) && !this.hasSetup;
  }

  get supportedComponent(): ComponentType {
    return ComponentType.FISHING;
  }

  protected createGameData(entity: Entity, component: FishingComponent) {
    const fishingLinePx = MapHelper.pointToPixelCentered(new Point(
      component.targetPoint.x,
      component.targetPoint.y
    ));

    const posComp = entity.getComponent(ComponentType.POSITION) as PositionComponent;
    if (!posComp) {
      return;
    }

    // const path = new Phaser.Curves.Path(fishingLinePx.x, fishingLinePx.y);
    // path.lineTo(entityPx.x, entityPx.y);

    /*
    const startPoint = new Phaser.Math.Vector2(entityPx.x, entityPx.y);
    const controlPoint1 = new Phaser.Math.Vector2(50, 100);
    const controlPoint2 = new Phaser.Math.Vector2(600, 100);
    const endPoint = new Phaser.Math.Vector2(fishingLinePx.x, fishingLinePx.y);
    const curve = new Phaser.Curves.CubicBezier(startPoint, controlPoint1, controlPoint2, endPoint);
    */

    this.fishingGraphics.clear();
    const entityPx = MapHelper.pointToPixelCentered(posComp.position);
    this.fishingGraphics.strokeCircle(fishingLinePx.x, fishingLinePx.y, 5);
    this.fishingGraphics.lineStyle(1, 0xffffff, 1);
    this.fishingGraphics.lineBetween(entityPx.x + 10, entityPx.y - 30, fishingLinePx.x, fishingLinePx.y);

    this.hasSetup = true;
  }

  protected updateGameData(entity: Entity, component: FishingComponent) {
  }
}
