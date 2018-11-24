import { ComponentRenderer } from './ComponentRenderer';
import { FishingComponent, ComponentType, Entity, PositionComponent } from 'app/game/entities';
import { EngineContext } from '../../EngineContext';
import { MapHelper } from '../../MapHelper';
import { Point, Px } from 'app/game/model';
import { UIAtlasBase, UIConstants, UIAtlasFx } from 'app/game/ui';
import { sendToServer, UpdateComponentMessage, ComponentDeleteMessage } from 'app/game/message';
import { VisualDepth } from '../VisualDepths';
import { ProjectileComponent } from 'app/game/entities/components/ProjectileComponent';

export interface ProjectileData {
  projectileImage: Phaser.GameObjects.Image;
}

export class ProjectileComponentRenderer extends ComponentRenderer<ProjectileComponent> {

  constructor(
    private readonly ctx: EngineContext
  ) {
    super(ctx.game);
  }

  protected createGameData(entity: Entity, component: ProjectileComponent) {
    const img = this.ctx.game.physics.add.image(0, 0, UIAtlasFx, UIConstants.PROJ_ARROW_01);

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
    // this.updateVelocity(entity, component);
  }

  protected updateGameData(entity: Entity, component: ProjectileComponent) {
    // throw new Error("Method not implemented.");
  }

  private updateVelocity(entity: Entity, component: ProjectileComponent) {
    const vPxPerS = component.speed * MapHelper.TILE_SIZE_PX;
    const body = (entity.data.projectile.projectileImage.body as Phaser.Physics.Arcade.Body);
    const updatedVelocity = body.velocity.normalize().scale(vPxPerS);
    body.velocity = updatedVelocity;
  }

  private updateProjectileRotation(entity: Entity, component: ProjectileComponent) {
    // Phaser.Math.RadToDeg(normalAngle)
    // this.ctx.game.physics.moveToObject()
    const projectile = entity.data.projectile.projectileImage;
    const rotation = Phaser.Math.Angle.Between(
      projectile.x,
      projectile.y,
      component.targetPoint.x,
      component.targetPoint.y
    );
    // TODO Correct this in the sprite sheet.
    const offset =  Math.PI / 2;
    entity.data.projectile.projectileImage.rotation = rotation;
    // entity.data.projectile.projectileImage.rotation = rotation - offset;
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
