import * as LOG from 'loglevel';

import { Entity, ComponentType, VisualComponent, PositionComponent, PlayerComponent, BuildingComponent } from 'app/game/entities';
import { Point, Size } from 'app/game/model';

import { EngineContext } from './EngineContext';
import { getSpriteDescriptionFromCache } from './renderer/component/SpriteDescription';
import { BuildingDescription } from './renderer/component/BuildingComponentRenderer';
import { MapHelper } from './MapHelper';

export class CollisionUpdater {

  private collisionMap: number[][] = [[]];
  public isDirty = true;
  private displayTileSize: Size;
  private checkedBuildingEntityIds = new Set<number>();

  constructor(
    private readonly ctx: EngineContext
  ) {
    ctx.pathfinder.setAcceptableTiles(0);
  }

  /**
   * Everytime the visible parts of the game canvas have changed (resized) this method
   * must be called to adapt the collision map accordingly.
   */
  resetCollisionMapSize() {
    this.displayTileSize = this.ctx.helper.display.getDisplaySizeInTiles();
    LOG.debug(`Collision map size: w: ${this.displayTileSize.width}, h: ${this.displayTileSize.height}`);
    this.collisionMap = new Array(this.displayTileSize.height);

    for (let i = 0; i < this.collisionMap.length; i++) {
      const element = new Array(this.displayTileSize.width);
      element.fill(0);
      this.collisionMap[i] = element;
    }

    this.ctx.pathfinder.setGrid(this.collisionMap);
    this.update();
  }

  private clearCollisionMap() {
    for (let i = 0; i < this.collisionMap.length; i++) {
      this.collisionMap[i].fill(0);
    }
  }

  public update() {
    this.ctx.pathfinder.calculate();

    // TODO Do this only if a entity has changed.
    // This is for now and inefficent.
    this.isDirty = true;
    this.clearCollisionMap();

    if (!this.isDirty) {
      return;
    }

    this.updateCollisionMapFromTilemap();
    this.updateCollisionFromEntities();

    // TODO Check if this call is needed or if the grid is hold by reference anyways
    this.ctx.pathfinder.setGrid(this.collisionMap);
    this.isDirty = false;
  }

  private updateCollisionFromEntities() {
    this.checkedBuildingEntityIds.clear();

    this.ctx.entityStore.entities.forEach(entity => {
      const isPlayerEntity = this.ctx.playerHolder.isActivePlayerEntity(entity);
      if (isPlayerEntity) {
        return;
      }

      if (this.isSprite(entity)) {
        this.updateCollisionSpriteEntity(entity);
      }

      if (this.isBuilding(entity)) {
        this.updateCollisionBuildingEntity(entity);
      }
    });
  }

  private updateCollisionSpriteEntity(entity: Entity) {
    const visualComp = entity.getComponent(ComponentType.VISUAL) as VisualComponent;
    const positionComp = entity.getComponent(ComponentType.POSITION) as PositionComponent;
    if (!visualComp.visible) {
      return;
    }

    const scrollOffset = this.ctx.helper.display.getScrollOffset();
    const displaySize = this.ctx.helper.display.getDisplaySizeInTiles();

    if (!this.isEntityInRange(
      positionComp.position,
      scrollOffset,
      displaySize
    )) {
      return;
    }

    const spriteName = visualComp.sprite;
    const spriteDesc = getSpriteDescriptionFromCache(spriteName, this.ctx.gameScene);
    const collision = spriteDesc && spriteDesc.collision || [[]];

    const sprite = entity.data.visual.sprite;
    const spriteTopLeft = this.ctx.helper.sprite.getSpriteTopLeftPoint(sprite);

    for (let dy = 0; dy < collision.length; dy++) {
      for (let dx = 0; dx < collision[dy].length; dx++) {
        if (collision[dy][dx] === 1) {
          const x = spriteTopLeft.x + dx - scrollOffset.x;
          const y = spriteTopLeft.y + dy - scrollOffset.y;
          this.collisionMap[y][x] = 1;
        }
      }
    }
  }

  private updateCollisionBuildingEntity(entity: Entity) {
    // Break early if we already have checked this entity
    if (this.checkedBuildingEntityIds.has(entity.id)) {
      return;
    }
    const scrollOffset = this.ctx.helper.display.getScrollOffset();
    const buildingComp = entity.getComponent(ComponentType.BUILDING) as BuildingComponent;
    const desc = this.ctx.gameScene.cache.json.get(buildingComp.spriteSheet + '_desc') as BuildingDescription;
    const allConnectedEntityIds = this.getAllConnectedEntities(entity.id, buildingComp.connectedEntityIds);

    allConnectedEntityIds.forEach(eId => {
      const currentEntity = this.ctx.entityStore.getEntity(eId);
      // const posComp = currentEntity.getComponent(ComponentType.POSITION) as PositionComponent;

      for (let dy = scrollOffset.y; dy < scrollOffset.y + desc.blockSize; dy++) {
        for (let dx = scrollOffset.x; dx < scrollOffset.x + desc.blockSize; dx++) {
          this.collisionMap[dy][dx] = 1;
        }
      }
    });
  }

  private getAllConnectedEntities(currentId: number, connected: { top: number, right: number, bottom: number, left: number }): number[] {
    if (this.checkedBuildingEntityIds.has(currentId) || currentId === 0) {
      return [];
    }
    this.checkedBuildingEntityIds.add(currentId);

    const checked = [currentId];
    const toCheck = [connected.top || 0, connected.bottom || 0, connected.left || 0, connected.right || 0];

    toCheck.forEach(eid => {
      // Safety check
      if (eid === 0) {
        return;
      }
      const entity = this.ctx.entityStore.getEntity(eid);
      const buildingComp = entity.getComponent(ComponentType.BUILDING) as BuildingComponent;
      checked.push(...this.getAllConnectedEntities(eid, buildingComp.connectedEntityIds));
    });

    return checked;
  }

  private updateCollisionMapFromTilemap() {
    const scrollOffset = this.ctx.helper.display.getScrollOffset();
    const displaySize = this.ctx.helper.display.getDisplaySizeInTiles();

    for (let y = 0; y < displaySize.height; y++) {
      for (let x = 0; x < displaySize.width; x++) {
        this.ctx.data.tilemap.layers.forEach((layer: Phaser.Tilemaps.StaticTilemapLayer) => {
          const tile = layer.getTileAt(x + scrollOffset.x, y + scrollOffset.y);

          if (tile == null) {
            return;
          }

          const doesCollideOnTile = (tile.properties as any).collision || false;
          if (doesCollideOnTile) {
            this.collisionMap[y][x] = 1;
          }
        });
      }
    }
  }

  private isSprite(entity: Entity) {
    return entity.hasComponent(ComponentType.VISUAL)
      && entity.hasComponent(ComponentType.POSITION);
  }

  private isBuilding(entity: Entity) {
    return entity.hasComponent(ComponentType.BUILDING)
      && entity.hasComponent(ComponentType.POSITION);
  }

  private isEntityInRange(pos: Point, displayOffset: Point, displaySize: Size): boolean {
    const isInLowerBound = pos.x >= displayOffset.x && pos.y >= displayOffset.y;
    const isInUpperBound = pos.x <= displayOffset.x + displaySize.width && pos.y <= displayOffset.y + displaySize.height;
    return isInLowerBound && isInUpperBound;
  }

  public hasCollision(x: number, y: number): boolean {
    if (this.collisionMap.length < y || this.collisionMap[0].length < x || x < 0 || y < 0) {
      LOG.warn(`Requested coordinate ${x}-${y} is not inside collision map.`);
      return true;
    }
    return this.collisionMap[y][x] !== 0;
  }
}
