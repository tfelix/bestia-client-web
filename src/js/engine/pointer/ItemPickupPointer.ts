import * as LOG from 'loglevel';

import { Pointer } from './Pointer';
import { PointerManager } from './PointerManager';
import { EngineContext } from '../EngineContext';
import { PointerPriority } from './PointerPriority';
import { Px } from 'model';
import { Entity, PlayerEntityHolder } from 'entities';
import { ComponentType, EntityTypeComponent, EntityType, VisualComponent, PositionComponent } from 'entities/components';
import { Topics } from 'Topics';
import { ItemPickupMessage } from 'message';

export class ItemPickupPointer extends Pointer {

  private activeSprite: Phaser.GameObjects.Sprite;
  private playerHolder: PlayerEntityHolder;

  constructor(
    manager: PointerManager,
    ctx: EngineContext
  ) {
    super(manager, ctx);

    this.playerHolder = ctx.playerHolder;
  }

  public allowOverwrite(): boolean {
    return true;
  }

  public checkActive(pointer: Px, entity?: Entity): number {
    return this.isEntityItem(entity) ? PointerPriority.ITEM_PICKUP : PointerPriority.NONE;
  }

  public deactivate() {
    if (this.activeSprite) {
      this.activeSprite.clearTint();
      this.activeSprite = null;
    }
  }

  private isEntityItem(entity?: Entity): boolean {
    if (!entity) {
      return false;
    }
    const entityTypeComp = entity.getComponent(ComponentType.ENTITY_TYPE) as EntityTypeComponent;
    return entityTypeComp && entityTypeComp.entityType === EntityType.ITEM;
  }

  public onClick(pointer: Px, entity?: Entity) {
    if (!this.isEntityItem(entity)) {
      return;
    }

    const d = PositionComponent.getDistance(this.ctx.playerHolder.activeEntity, entity);
    if (d > 0) {
      this.ctx.helper.move.moveToPixel(pointer, () => this.pickupItem(entity));
    } else {
      this.pickupItem(entity);
    }
  }

  private pickupItem(itemEntity: Entity) {
    VisualComponent.playOneShotAnimation(itemEntity, 'item_pickup');
    const pickupMsg = new ItemPickupMessage(itemEntity.id, 1);
    PubSub.publish(Topics.IO_SEND_MSG, pickupMsg);
  }

  public updatePosition(pointer: Px, entity?: Entity) {
    if (entity) {
      const sprite = entity.data.visual && entity.data.visual.sprite;
      if (sprite) {
        sprite.setTint(0x0000FF);
        this.activeSprite = sprite;
      }
    }
  }
}
