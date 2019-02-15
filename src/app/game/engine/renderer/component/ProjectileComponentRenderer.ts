import { ComponentRenderer } from './ComponentRenderer';
import { ComponentType, Entity, PositionComponent } from 'app/game/entities';
import { EngineContext } from '../../EngineContext';
import { MapHelper } from '../../MapHelper';
import { Point } from 'app/game/model';
import { UIConstants, AtlasFx } from 'app/game/ui';
import { ProjectileComponent } from 'app/game/entities/components/ProjectileComponent';

export interface ProjectileData {
  projectileImage: Phaser.GameObjects.Image;
}

export class ProjectileComponentRenderer extends ComponentRenderer<ProjectileComponent> {

  constructor(
    private readonly ctx: EngineContext
  ) {
    super(ctx.gameScene);
  }

  protected createGameData(entity: Entity, component: ProjectileComponent) {
    const img = this.ctx.gameScene.physics.add.image(0, 0, AtlasFx, UIConstants.PROJ_ARROW_01);

    entity.data.projectile = {
      projectileImage: img
    };

    this.updateProjectilePosition(entity, component);
    this.updateProjectileRotation(entity, component);

    const targetPoint = new Point(component.targetPoint.x, component.targetPoint.y);
    const posPx = MapHelper.pointToPixelCentered(targetPoint);
    const vPxPerS = component.speed * MapHelper.TILE_SIZE_PX;
    this.game.physics.moveTo(
      img,
      posPx.x,
      posPx.y,
      vPxPerS
    );
  }

  protected updateGameData(entity: Entity, component: ProjectileComponent) {
  }

  private updateVelocity(entity: Entity, component: ProjectileComponent) {
    const vPxPerS = component.speed * MapHelper.TILE_SIZE_PX;
    const body = (entity.data.projectile.projectileImage.body as Phaser.Physics.Arcade.Body);
    const updatedVelocity = body.velocity.normalize().scale(vPxPerS);
    body.velocity = updatedVelocity;
  }

  private updateProjectileRotation(entity: Entity, component: ProjectileComponent) {
    const projectile = entity.data.projectile.projectileImage;
    const test = MapHelper.pointToPixel(component.targetPoint);
    const rotation = Phaser.Math.Angle.Between(
      projectile.x,
      projectile.y,
      test.x,
      test.y
    )  + Math.PI / 2;
    entity.data.projectile.projectileImage.rotation = rotation;
  }

  private updateProjectilePosition(entity: Entity, component: ProjectileComponent) {
    const posComp = entity.getComponent(ComponentType.POSITION) as PositionComponent;
    if (!posComp) {
      return;
    }

    const posPx = MapHelper.pointToPixelCentered(posComp.position);
    entity.data.projectile.projectileImage.setPosition(posPx.x, posPx.y);
  }

  protected hasNotSetup(entity: Entity, component: ProjectileComponent): boolean {
    return !entity.data.projectile;
  }

  get supportedComponent(): ComponentType {
    return ComponentType.PROJECTILE;
  }
}
