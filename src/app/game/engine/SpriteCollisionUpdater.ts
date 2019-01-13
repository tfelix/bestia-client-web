import { Point, Size } from 'app/game/model';
import { Entity, ComponentType, PositionComponent, VisualComponent } from 'app/game/entities';
import { CollisionMapUpdater, CollisionMap } from './CollisionMap';
import { EngineContext } from './EngineContext';

export class SpriteCollisionUpdater implements CollisionMapUpdater {

  constructor(
    private readonly ctx: EngineContext
  ) {
  }

  public updateMap(map: CollisionMap) {
    this.ctx.entityStore.entities.forEach(entity => {
      const isPlayerEntity = this.ctx.playerHolder.isActivePlayerEntity(entity);
      if (isPlayerEntity) {
        return;
      }

      if (!this.isSprite(entity)) {
        return;
      }

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

      const spriteDesc = this.ctx.gameScene.cache.json.get(visualComp.jsonDescriptionName);
      const collision = spriteDesc && spriteDesc.collision || [[]];

      const sprite = entity.data.visual.sprite;
      const spriteTopLeft = this.ctx.helper.sprite.getSpriteTopLeftPoint(sprite);

      for (let dy = 0; dy < collision.length; dy++) {
        for (let dx = 0; dx < collision[dy].length; dx++) {
          if (collision[dy][dx] === 1) {
            const x = spriteTopLeft.x + dx - scrollOffset.x;
            const y = spriteTopLeft.y + dy - scrollOffset.y;
            map.setCollision(x, y, true);
          }
        }
      }
    });
  }

  private isEntityInRange(pos: Point, displayOffset: Point, displaySize: Size): boolean {
    const isInLowerBound = pos.x >= displayOffset.x && pos.y >= displayOffset.y;
    const isInUpperBound = pos.x <= displayOffset.x + displaySize.width && pos.y <= displayOffset.y + displaySize.height;
    return isInLowerBound && isInUpperBound;
  }

  private isSprite(entity: Entity) {
    return entity.hasComponent(ComponentType.VISUAL)
      && entity.hasComponent(ComponentType.POSITION);
  }
}
