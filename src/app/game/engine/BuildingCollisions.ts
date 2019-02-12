import { Entity } from '../entities/Entity';
import { ComponentType } from '../entities/components/ComponentType';
import { EngineContext } from './EngineContext';
import { BoundingBoxFactory, BuildingComponent } from '../entities';

export class BuildingCollisions {

  private readonly currentEnteredBuildingEntityIds = new Set<number>();
  private readonly bboxFactory: BoundingBoxFactory;

  constructor(
    private readonly ctx: EngineContext
  ) {
    this.bboxFactory = new BoundingBoxFactory(ctx.gameScene.cache);
  }

  public collides(a: Entity, b: Entity): boolean {
    const bboxA = this.bboxFactory.makeBoundingBox(a);
    const bboxB = this.bboxFactory.makeBoundingBox(b);

    if (bboxA === null || bboxB === null) {
      return false;
    }

    return Phaser.Geom.Rectangle.Overlaps(bboxA, bboxB);
  }

  private getCurrentBuildingEntity(player: Entity): Entity | null {
    const allBuildingEntities = this.ctx.entityStore.getAllEntitiesWithComponents(
      ComponentType.BUILDING,
      ComponentType.POSITION
    );

    for (const buildingEntity of allBuildingEntities) {
      if (this.collides(player, buildingEntity)) {
        return buildingEntity;
      }
    }

    return null;
  }

  /**
   * Checks if the player is still inside the building.
   */
  public update() {
    const player = this.ctx.playerHolder.activeEntity;
    const currentBuilding = this.getCurrentBuildingEntity(player);

    if (!currentBuilding) {
      this.currentEnteredBuildingEntityIds.clear();
      return;
    }

    const building = currentBuilding.getComponent(ComponentType.BUILDING) as BuildingComponent;
    const connectedBuildingEntities = building.findAllConnectedEntityIds(this.ctx.entityStore);

    if (connectedBuildingEntities.length !== this.currentEnteredBuildingEntityIds.size) {
      this.currentEnteredBuildingEntityIds.clear();
      connectedBuildingEntities.forEach(eid => this.currentEnteredBuildingEntityIds.add(eid));
    }
  }

  public isInsideBuilding(): boolean {
    return this.currentEnteredBuildingEntityIds.size !== 0;
  }

  public getCurrentOccupiedBuildingEntityIds(): number[] | null {
    return Array.from(this.currentEnteredBuildingEntityIds);
  }
}
