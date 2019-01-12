import { Entity } from './Entity';
import { ComponentType, VisualComponent, BuildingComponent, PositionComponent } from './components';
import { MapHelper } from '../engine/MapHelper';
import { BuildingDescription } from '../engine/renderer/component/BuildingComponentRenderer';

/**
 * This class holds and caches collision data for entities which can be used
 * in order to check if they are corrently colliding.
 *
 * TODO Later implementations might have some fancy caching algorithm in order
 * to speed up the calculation.
 */
export class EntityCollisionChecker {

  constructor(
    private readonly cache: Phaser.Cache.CacheManager
  ) {
  }

  public collides(a: Entity, b: Entity): boolean {
    const hasAPosition = a.hasComponent(ComponentType.POSITION);
    const hasBPosition = b.hasComponent(ComponentType.POSITION);

    if (!hasAPosition || !hasBPosition) {
      return false;
    }

    const bboxA = this.makeBoundingBox(a);
    const bboxB = this.makeBoundingBox(b);

    if (bboxA === null || bboxB === null) {
      return false;
    }

    return Phaser.Geom.Rectangle.Overlaps(bboxA, bboxB);
  }

  /**
   * Generates a collision checkable bounding box for the entity. This bounding
   * box is in world pixel space.
   */
  private makeBoundingBox(entity: Entity): Phaser.Geom.Rectangle | null {
    const positionComp = entity.getComponent(ComponentType.POSITION) as PositionComponent;

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
