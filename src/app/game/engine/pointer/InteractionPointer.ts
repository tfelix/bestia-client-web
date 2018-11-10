import {
  ComponentType, EntityTypeComponent, InteractionLocalComponent,
  SelectLocalComponent, Entity, InteractionCache
} from 'app/game/entities';
import { RequestInteractionMessage, EngineEvents } from 'app/game/message';
import { Px, Point } from 'app/game/model';

import { Pointer } from './Pointer';
import { PointerManager } from './PointerManager';
import { EngineContext } from '../EngineContext';
import { PointerPriority } from './PointerPriority';

/**
 * The interaction pointer is there to initialize a interaction which is then handled by special pointers.
 * This one basically only checks if there is no default component and will either establish default ones
 * or ask the server.
 */
export class InteractionPointer extends Pointer {
  private activeEntity?: Entity = null;

  private interactionCache = new InteractionCache();

  constructor(
    protected readonly manager: PointerManager,
    protected readonly ctx: EngineContext
  ) {
    super(manager, ctx);
  }

  public reportPriority(px: Px, pos: Point, overEntity?: Entity): number {
    if (!overEntity) {
      return PointerPriority.NONE;
    }

    const interactionComp = overEntity.getComponent(ComponentType.LOCAL_INTERACTION) as InteractionLocalComponent;
    if (!interactionComp) {
      this.requestInteractionFromServer(overEntity);
      return PointerPriority.INTERACTION;
    }

    if (this.canInteractWithTile(pos)) {
      return PointerPriority.INTERACTION;
    }

    if (!interactionComp.activeInteraction) {
      return PointerPriority.INTERACTION;
    }

    return PointerPriority.NONE;
  }

  private canInteractWithTile(position: Px) {
    const tile = this.ctx.data.tilemap.map.getTileAtWorldXY(position.x, position.y);
    if ((tile.properties as any).fishing) {
      return true;
    }
    return false;
  }

  private requestInteractionFromServer(entity: Entity) {
    const requestMsg = new RequestInteractionMessage(entity.id);
    PubSub.publish(EngineEvents.IO_SEND_MSG, requestMsg);
  }

  private trySetupDefaultInteraction(entity: Entity) {
    const interactionComp = entity.getComponent(ComponentType.LOCAL_INTERACTION) as InteractionLocalComponent;
    const hasDefaultInteraction = interactionComp && !!interactionComp.activeInteraction;

    if (hasDefaultInteraction) {
      return;
    }

    const entityTypeComp = entity.getComponent(ComponentType.ENTITY_TYPE) as EntityTypeComponent;

    const defaultInteraction = entityTypeComp && this.interactionCache.get(entityTypeComp.entityType);
    if (interactionComp && defaultInteraction) {
      interactionComp.activeInteraction = defaultInteraction;
    }
  }

  public update(entity?: Entity) {
    if (!entity) {
      return;
    }

    this.trySetupDefaultInteraction(entity);
  }

  public onClick(position: Px, pos: Point, clickedEntity?: Entity) {
    if (!clickedEntity) {
      return;
    }

    if (clickedEntity === this.activeEntity) {
      this.removeSelection();
      return;
    }

    if (this.activeEntity) {
      this.removeSelection();
      return;
    }

    const interactionComp = clickedEntity.getComponent(ComponentType.LOCAL_INTERACTION) as InteractionLocalComponent;
    if (interactionComp && interactionComp.possibleInteractions.size > 0) {
      clickedEntity.addComponent(new SelectLocalComponent(clickedEntity.id));
      this.activeEntity = clickedEntity;
    }
  }

  private removeSelection() {
    if (this.activeEntity) {
      this.activeEntity.removeComponentByType(ComponentType.LOCAL_SELECT);
      this.activeEntity = null;
    }
  }
}
