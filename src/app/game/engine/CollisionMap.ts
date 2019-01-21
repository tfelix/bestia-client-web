import * as LOG from 'loglevel';

import { Size } from 'app/game/model';

import { EngineContext } from './EngineContext';
import { SpriteCollisionUpdater } from './SpriteCollisionUpdater';
import { TilemapCollisionUpdater } from './TilemapCollisionUpdater';
import { BuildingCollisionUpdater } from './BuildingCollisionUpdater';

export interface CollisionMapUpdater {
  updateMap(map: CollisionMap);
}

export class CollisionMap {
  private collisionMap: number[][] = [[]];
  private displayTileSize: Size;
  private updaters: CollisionMapUpdater[] = [];

  constructor(
    private readonly ctx: EngineContext
  ) {
    ctx.pathfinder.setAcceptableTiles(0);

    this.updaters.push(new SpriteCollisionUpdater(ctx));
    this.updaters.push(new TilemapCollisionUpdater(ctx));
    this.updaters.push(new BuildingCollisionUpdater(ctx));
  }

  /**
   * Everytime the visible parts of the game canvas have changed (resized) this method
   * must be called to adapt the collision map accordingly.
   */
  public updateCollisionMapSize() {
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

  public clearCollisionMap() {
    for (let i = 0; i < this.collisionMap.length; i++) {
      this.collisionMap[i].fill(0);
    }
  }

  public update() {
    this.ctx.pathfinder.calculate();

    this.clearCollisionMap();

    this.updaters.forEach(u => u.updateMap(this));

    this.ctx.pathfinder.setGrid(this.collisionMap);
  }

  public setCollision(x: number, y: number, collision: boolean) {
    if (this.collisionMap.length < y || this.collisionMap[0].length < x || x < 0 || y < 0) {
      return;
    }
    const flag = (collision) ? 1 : 0;
    return this.collisionMap[y][x] = flag;
  }

  public hasCollision(x: number, y: number): boolean {
    if (this.collisionMap.length < y || this.collisionMap[0].length < x || x < 0 || y < 0) {
      LOG.warn(`Requested coordinate ${x}-${y} is not inside collision map.`);
      return true;
    }
    return this.collisionMap[y][x] !== 0;
  }
}
