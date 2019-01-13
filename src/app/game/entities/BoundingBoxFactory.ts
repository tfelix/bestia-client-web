import { Entity } from './Entity';
import { ComponentType, VisualComponent, BuildingComponent, PositionComponent } from './components';
import { MapHelper } from '../engine/MapHelper';
import { BuildingDescription } from '../engine/renderer/component/BuildingComponentRenderer';

export class BoundingBoxFactory {
  constructor(
    private readonly cache: Phaser.Cache.CacheManager
  ) {
  }

  /**
   * Generates a collision checkable bounding box for the entity. This bounding
   * box is in world pixel space.
   */
  public makeBoundingBox(entity: Entity): Phaser.Geom.Rectangle | null {
    const positionComp = entity.getComponent(ComponentType.POSITION) as PositionComponent;

    if (!positionComp) {
      return null;
    }

    const visualComp = entity.getComponent(ComponentType.VISUAL) as VisualComponent;
    if (visualComp) {
      return this.makeBoundingBoxFromVisual(positionComp, visualComp);
    }

    const buildingComp = entity.getComponent(ComponentType.BUILDING) as BuildingComponent;
    if (buildingComp) {
      return this.makeBoundingBoxFromBuilding(positionComp, buildingComp);
    }

    return null;
  }

  private makeBoundingBoxFromVisual(posComp: PositionComponent, visualComp: VisualComponent): Phaser.Geom.Rectangle {
    // TODO For now we only have one field of collision for visual sprites.
    const pxPos = MapHelper.pointToPixel(posComp.position);

    return new Phaser.Geom.Rectangle(pxPos.x, pxPos.y, MapHelper.TILE_SIZE_PX, MapHelper.TILE_SIZE_PX);
  }

  private makeBoundingBoxFromBuilding(posComp: PositionComponent, building: BuildingComponent): Phaser.Geom.Rectangle {
    const desc = this.cache.json.get(building.jsonDescriptionName) as BuildingDescription;
    const pxPos = MapHelper.pointToPixel(posComp.position);
    const buildingBlockSize = desc.blockSize * MapHelper.TILE_SIZE_PX;

    return new Phaser.Geom.Rectangle(pxPos.x, pxPos.y, buildingBlockSize, buildingBlockSize);
  }
}

