import { EngineContext } from './EngineContext';
import { Entity, ComponentType, BuildingComponent, PositionComponent } from 'app/game/entities';
import { BuildingDescription } from './renderer/component/BuildingComponentRenderer';
import { CollisionMapUpdater, CollisionMap } from './CollisionMap';
import { Vec2, Point } from '../model';

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
    const buildingEntityIds = this.ctx.collision.building.getCurrentOccupiedBuildingEntityIds();

    if (buildingEntityIds.length === 0) {
      return;
    }

    const firstBuildingId = buildingEntityIds[0];
    const buildingDescName = (this.ctx.entityStore
      .getComponentFromEntityId(firstBuildingId, ComponentType.BUILDING) as BuildingComponent)
      .jsonDescriptionName;
    const buildingDesc = this.ctx.gameScene.cache.json.get(buildingDescName) as BuildingDescription;

    // Find all border tiles of the building.
    const borderCandidates: Vec2[] = [];
    const doors: Vec2[] = [];
    buildingEntityIds.map(id => this.ctx.entityStore.getEntity(id))
      .forEach(buildingEntity => {
        const buildingComp = (buildingEntity.getComponent(ComponentType.BUILDING) as BuildingComponent);
        const offset = (buildingEntity.getComponent(ComponentType.POSITION) as PositionComponent).position;
        for (let dx = 0; dx < buildingDesc.blockSize; dx++) {
          for (let dy = 0; dy < buildingDesc.blockSize; dy++) {

            const p = new Point(dx + offset.x, dy + offset.y);
            borderCandidates.push(p);

            if (this.isDoor(dx, dy, buildingDesc, buildingComp)) {
              doors.push(p);
            }
          }
        }

      });

    const border = borderCandidates.map(bc => {
      return { pos: bc, neighbours: this.countNeighbours(bc, borderCandidates) };
    }).filter(bc => bc.neighbours !== 4)
      // Remove Doors
      .filter(bc => !this.isPointInArray(bc.pos, doors))
      .map(bc => bc.pos);

    const scrollOffset = this.ctx.helper.display.getScrollOffset();
    border.forEach(b => {
      map.setCollision(b.x - scrollOffset.x, b.y - scrollOffset.y, true);
    });
  }

  /**
   * Counts the direct neighbours of a tile.
   */
  private countNeighbours(tile: Vec2, tiles: Vec2[]): number {
    const hasTop = tiles.findIndex(t => t.x === tile.x && t.y === tile.y - 1) !== -1;
    const hasBottom = tiles.findIndex(t => t.x === tile.x && t.y === tile.y + 1) !== -1;
    const hasLeft = tiles.findIndex(t => t.x === tile.x - 1 && t.y === tile.y) !== -1;
    const hasRight = tiles.findIndex(t => t.x === tile.x + 1 && t.y === tile.y - 1) !== -1;

    let neigbour = 0;
    if (hasTop) {
      neigbour++;
    }
    if (hasBottom) {
      neigbour++;
    }
    if (hasLeft) {
      neigbour++;
    }
    if (hasRight) {
      neigbour++;
    }

    return neigbour;
  }

  private isPointInArray(p: Vec2, ps: Vec2[]): boolean {
    return ps.findIndex(a => a.x === p.x && a.y === p.y) !== -1;
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

  private isDoor(dx: number, dy: number, desc: BuildingDescription, buildingComp: BuildingComponent): boolean {
    for (let i = 0; i < desc.doors.length; i++) {
      const d = desc.doors[i];
      if (d.name === buildingComp.innerSprite || d.name === buildingComp.outerSprite) {
        if (d.position.x === dx && d.position.y === dy) {
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
