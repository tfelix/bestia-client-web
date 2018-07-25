import { Pointer, PointerManager } from '.';
import { EngineContext } from '../EngineContext';
import { PointerPriority } from './PointerPriority';
import { Px } from 'model';
import { Entity, InteractionCache } from 'entities';
import {
  ComponentType, EntityTypeComponent, EntityType, InteractionLocalComponent,
  InteractionType, SelectLocalComponent, InventoryComponent
} from 'entities/components';
import { RequestInteractionMessage } from 'message/RequestInteractionMessage';
import { Topics } from 'connection';

/**
 * The interaction pointer is there to initialize a interaction which is then handled by special pointers.
 * This one basically only checks if there is no default component and will either establish default ones
 * or ask the server.
 */
export class InteractionPointer extends Pointer {

  private activeSprite: Phaser.GameObjects.Sprite;
  private activeEntity?: Entity = null;

  private interactionCache = new InteractionCache();

  constructor(
    protected readonly manager: PointerManager,
    protected readonly ctx: EngineContext
  ) {
    super(manager, ctx);
  }

  public checkActive(position: Px, mouseoverEntity?: Entity): number {
    if (this.isInteractionPointerResponsible(mouseoverEntity) || this.canInteractWithTile(position)) {
      return PointerPriority.INTERACTION;
    }
    return PointerPriority.NONE;
  }

  private canInteractWithTile(position: Px) {
    return false;
  }

  private isInteractionPointerResponsible(entity?: Entity): boolean {
    if (!entity) {
      return false;
    }

    const interactionComp = entity.getComponent(ComponentType.LOCAL_INTERACTION) as InteractionLocalComponent;

    if (!interactionComp) {
      this.requestInteractionFromServer(entity);
      return false;
    } else {
      this.setupDefaultInteraction(interactionComp, entity);
    }

    if (interactionComp.activeInteraction) {
      return false;
    } else {
      return true;
    }
  }

  private requestInteractionFromServer(entity: Entity) {
    const requestMsg = new RequestInteractionMessage(entity.id);
    PubSub.publish(Topics.IO_SEND_MSG, requestMsg);
  }

  private setupDefaultInteraction(interactions: InteractionLocalComponent, entity: Entity) {
    if (interactions.activeInteraction) {
      return;
    }
    const entityTypeComp = entity.getComponent(ComponentType.ENTITY_TYPE) as EntityTypeComponent;
    const entityType = entityTypeComp && entityTypeComp.entityType;
    const defaultInteraction = this.interactionCache.get(entityType);
    if (defaultInteraction) {
      interactions.activeInteraction = defaultInteraction;
    }
  }

  public onClick(position: Px, clickedEntity?: Entity) {
    if (!clickedEntity) {
      return;
    }

    const wasAlreadyActive = clickedEntity.hasComponent(ComponentType.LOCAL_SELECT);
    if (wasAlreadyActive) {
      clickedEntity.removeComponentByType(ComponentType.LOCAL_SELECT);
      this.activeEntity = null;
      return;
    } else {
      if (this.activeEntity) {
        this.activeEntity.removeComponentByType(ComponentType.LOCAL_SELECT);
        this.activeEntity = null;
      }

      clickedEntity.addComponent(new SelectLocalComponent(clickedEntity.id));
      this.activeEntity = clickedEntity;
    }
  }

  public updatePointerPosition(pointer: Px, entity?: Entity) {
    if (entity) {
      const sprite = entity.data.visual && entity.data.visual.sprite;
      if (sprite) {
        sprite.setTint(0x00FF00);
        this.activeSprite = sprite;
      }
    }
  }

  public deactivate() {
    if (this.activeSprite) {
      this.activeSprite.clearTint();
      this.activeSprite = null;
    }
  }
}
