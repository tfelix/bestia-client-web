import * as LOG from 'loglevel';
import { Pointer, PointerManager } from '.';
import { EngineContext } from '../EngineContext';
import { PointerPriority } from './PointerPriority';
import { Px } from 'model';
import { Entity, InteractionCache } from 'entities';
import {
  ComponentType, EntityTypeComponent, InteractionLocalComponent,
  SelectLocalComponent
} from 'entities/components';
import { RequestInteractionMessage } from 'message/RequestInteractionMessage';
import { Topics } from 'connection';

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

  public checkActive(position: Px, mouseoverEntity?: Entity): number {
    if (!mouseoverEntity) {
      return PointerPriority.NONE;
    }

    const interactionComp = mouseoverEntity.getComponent(ComponentType.LOCAL_INTERACTION) as InteractionLocalComponent;
    if (!interactionComp) {
      this.requestInteractionFromServer(mouseoverEntity);
      return PointerPriority.INTERACTION;
    }

    if (this.canInteractWithTile(position)) {
      return PointerPriority.INTERACTION;
    }

    if (!interactionComp.activeInteraction) {
      return PointerPriority.INTERACTION;
    }

    return PointerPriority.NONE;
  }

  private canInteractWithTile(position: Px) {
    return false;
  }

  private requestInteractionFromServer(entity: Entity) {
    const requestMsg = new RequestInteractionMessage(entity.id);
    PubSub.publish(Topics.IO_SEND_MSG, requestMsg);
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

  public onClick(position: Px, clickedEntity?: Entity) {
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

  public updatePointerPosition(pointer: Px, entity?: Entity) {
  }

  public deactivate() {
  }
}
