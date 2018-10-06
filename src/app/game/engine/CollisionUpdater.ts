import * as LOG from 'loglevel';

import { Entity, ComponentType, VisualComponent, PositionComponent } from 'app/game/entities';
import { Point, Size } from 'app/game/model';

import { EngineContext } from './EngineContext';
import { getSpriteDescriptionFromCache } from './renderer/component/SpriteDescription';
import { DisplayHelper } from './DisplayHelper';

export class CollisionUpdater {

  private collisionMap: number[][];
  public isDirty = true;
  private displayTileSize: Size;
  private displayHelper: DisplayHelper;

  constructor(
    private readonly ctx: EngineContext
  ) {

    this.displayTileSize = ctx.helper.display.getDisplaySizeInTiles();
    LOG.debug(`Found collision map size: w: ${this.displayTileSize.width}, h: ${this.displayTileSize.height}`);

    this.collisionMap = new Array(this.displayTileSize.height);
    this.clearCollisionMap();
    ctx.pathfinder.setGrid(this.collisionMap);
    ctx.pathfinder.setAcceptableTiles(0);

    this.displayHelper = new DisplayHelper(this.ctx.game);
  }

  private clearCollisionMap() {
    for (let i = 0; i < this.collisionMap.length; i++) {
      const element = new Array(this.displayTileSize.width);
      element.fill(0);
      this.collisionMap[i] = element;
    }
  }

  public update() {
    this.ctx.pathfinder.calculate();

    // TODO Do this only if a entity has changed.
    // This is for now and inefficent.
    this.isDirty = true;
    this.clearCollisionMap();
    this.updateCollisionMap();
  }

  public updateCollisionMap() {
    if (!this.isDirty) {
      return;
    }

    const scrollOffset = this.displayHelper.getScrollOffset();
    const displaySize = this.displayHelper.getDisplaySizeInTiles();

    this.ctx.entityStore.entities.forEach(entity => {
      if (!this.hasEntityAllRequirements(entity)) {
        return;
      }

      const visualComp = entity.getComponent(ComponentType.VISUAL) as VisualComponent;
      const positionComp = entity.getComponent(ComponentType.POSITION) as PositionComponent;
      if (!visualComp.visible) {
        return;
      }

      if (!this.isEntityInRange(
        positionComp.position,
        scrollOffset,
        displaySize
      )) {
        return;
      }

      const spriteName = visualComp.sprite;
      const spriteDesc = getSpriteDescriptionFromCache(spriteName, this.ctx.game);
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
    });

    this.ctx.pathfinder.setGrid(this.collisionMap);
    this.isDirty = false;
  }

  private hasEntityAllRequirements(entity: Entity) {
    return entity.hasComponent(ComponentType.VISUAL) && entity.hasComponent(ComponentType.POSITION);
  }

  private isEntityInRange(pos: Point, displayOffset: Point, displaySize: Size): boolean {
    const isInLowerBound = pos.x >= displayOffset.x && pos.y >= displayOffset.y;
    const isInUpperBound = pos.x <= displayOffset.x + displaySize.width && pos.y <= displayOffset.y + displaySize.height;
    return isInLowerBound && isInUpperBound;
  }

  public hasCollision(x: number, y: number): boolean {
    if (this.displayTileSize.height < y || this.displayTileSize.width < x || x < 0 || y < 0) {
      LOG.warn(`Requested coordinate ${x}-${y} is not inside collision map.`);
      return true;
    }
    return this.collisionMap[y][x] !== 0;
  }
}
