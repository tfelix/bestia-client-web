import { EngineContext } from './EngineContext';
import { Entity, ComponentType, BuildingComponent, PositionComponent } from 'app/game/entities';
import { BuildingDescription } from './renderer/component/BuildingComponentRenderer';
import { CollisionMapUpdater, CollisionMap } from './CollisionMap';

export class BuildingCollisionUpdater implements CollisionMapUpdater {

  private checkedBuildingEntityIds = new Set<number>();

  constructor(
    private readonly ctx: EngineContext
  ) {

  }

  public updateMap(map: CollisionMap) {
    if (this.ctx.collision.building.isInsideBuilding()) {
      this.updateCollisionFromInsideBuilding(map);
    } else {
      this.updateCollisionWithBuildings(map);
    }
  }

  private updateCollisionFromInsideBuilding(map: CollisionMap) {

  }

  private updateCollisionWithBuildings(map: CollisionMap) {
    this.checkedBuildingEntityIds.clear();
    const allBuildingEntities = this.ctx.entityStore.getAllEntitiesWithComponents(
      ComponentType.BUILDING,
      ComponentType.POSITION
    );
    allBuildingEntities.forEach(entity => this.updateMapWithBuilding(map, entity));
  }

  private updateMapWithBuilding(map: CollisionMap, entity: Entity) {
    // Break early if we already have checked this entity
    if (this.checkedBuildingEntityIds.has(entity.id)) {
      return;
    }

    const scrollOffset = this.ctx.helper.display.getScrollOffset();
    const buildingComp = entity.getComponent(ComponentType.BUILDING) as BuildingComponent;
    const desc = this.ctx.gameScene.cache.json.get(buildingComp.jsonDescriptionName) as BuildingDescription;
    const allConnectedEntityIds = buildingComp.findAllConnectedEntityIds(this.ctx.entityStore);

    allConnectedEntityIds.forEach(eId => {
      const currentEntity = this.ctx.entityStore.getEntity(eId);
      const buildingConnectedComp = currentEntity.getComponent(ComponentType.BUILDING) as BuildingComponent;
      const posComp = currentEntity.getComponent(ComponentType.POSITION) as PositionComponent;

      // Break if some components are not yet attached to this entity during init.
      if (!buildingConnectedComp || !posComp) {
        return;
      }

      for (let dy = 0; dy < desc.blockSize; dy++) {
        for (let dx = 0; dx < desc.blockSize; dx++) {
          if (!this.isDoor(dx, dy, desc, buildingConnectedComp)) {
            const x = dx + (posComp.position.x - scrollOffset.x);
            const y = dy + (posComp.position.y - scrollOffset.y);
            map.setCollision(x, y, true);
          }
        }
      }
    });
  }

  private isDoor(x: number, y: number, desc: BuildingDescription, buildingComp: BuildingComponent): boolean {
    for (let i = 0; i < desc.doors.length; i++) {
      const d = desc.doors[i];
      if (d.name === buildingComp.innerSprite || d.name === buildingComp.outerSprite) {
        if (d.position.x === x && d.position.y === y) {
          return true;
        }
      }
    }

    return false;
  }

  private isBuilding(entity: Entity) {
    return entity.hasComponent(ComponentType.BUILDING)
      && entity.hasComponent(ComponentType.POSITION);
  }
}
