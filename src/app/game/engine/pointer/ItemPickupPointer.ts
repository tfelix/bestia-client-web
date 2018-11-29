import { Px, Point } from 'app/game/model';
import {
  Entity, ComponentType, VisualComponent, PositionComponent, HighlightComponent, EntityType, EntityTypeComponent
} from 'app/game/entities';
import { RequestItemLootMessage, EngineEvents } from 'app/game/message';

import { Pointer } from './Pointer';
import { PointerManager } from './PointerManager';
import { EngineContext } from '../EngineContext';
import { PointerPriority } from './PointerPriority';

export class ItemPickupPointer extends Pointer {
  private activeEntity: Entity;

  constructor(
    manager: PointerManager,
    ctx: EngineContext
  ) {
    super(manager, ctx);
  }

  public reportPriority(px: Px, pos: Point, overEntity?: Entity): number {
    return this.isEntityItem(overEntity) ? PointerPriority.ITEM_PICKUP : PointerPriority.NONE;
  }

  public deactivate() {
    if (this.activeEntity) {
      this.activeEntity.removeComponentByType(ComponentType.LOCAL_HIGHLIGHT);
      this.activeEntity = null;
    }
  }

  private isEntityItem(entity?: Entity): boolean {
    if (!entity) {
      return false;
    }
    const entityTypeComp = entity.getComponent(ComponentType.ENTITY_TYPE) as EntityTypeComponent;
    return entityTypeComp && entityTypeComp.entityType === EntityType.ITEM;
  }

  public onClick(position: Px, pos: Point, clickedEntity?: Entity) {
    if (!this.isEntityItem(clickedEntity)) {
      return;
    }

    const d = PositionComponent.getDistance(this.ctx.playerHolder.activeEntity, clickedEntity);
    if (d > 0) {
      this.ctx.helper.move.moveToPixel(position, () => this.pickupItem(clickedEntity));
    } else {
      this.pickupItem(clickedEntity);
    }
  }

  private pickupItem(itemEntity: Entity) {
    VisualComponent.playOneShotAnimation(itemEntity, 'item_pickup');
    const pickupMsg = new RequestItemLootMessage(itemEntity.id, 1);
    PubSub.publish(EngineEvents.IO_SEND_MSG, pickupMsg);
  }

  public updatePointerPosition(px: Px, pos: Point, overEntity?: Entity) {
    if (overEntity) {
      const highlightComponent = new HighlightComponent(overEntity.id);
      highlightComponent.color = 0x0000FF;
      overEntity.addComponent(highlightComponent);
      this.activeEntity = overEntity;
    }
  }
}
