import * as LOG from 'loglevel';
import { Pointer, PointerManager } from '.';
import { EngineContext } from '../EngineContext';
import { PointerPriority } from './PointerPriority';
import { Px } from 'model';
import { Entity, InteractionCache } from 'entities';
import {
  ComponentType, EntityTypeComponent, EntityType, InteractionLocalComponent,
  InteractionType, SelectLocalComponent
} from 'entities/components';
import { RequestInteractionMessage } from 'message/RequestInteractionMessage';
import { Topics } from 'Topics';

/**
 * The interaction pointer is there to initialize a interaction which is then handled by special pointers.
 * This one basically only checks if there is no default component and will either establish default ones
 * or ask the server.
 */
export class InteractionPointer extends Pointer {

  private activeSprite: Phaser.GameObjects.Sprite;
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

  private requestInteractions(entity: Entity) {
    const requestMsg = new RequestInteractionMessage(entity.id);
    PubSub.publish(Topics.IO_SEND_MSG, requestMsg);
  }

  private canInteractWithTile(position: Px) {
    return false;
  }

  private isInteractionPointerResponsible(entity?: Entity): boolean {
    if (!entity) {
      return false;
    }

    const interactionComp = entity.getComponent(ComponentType.LOCAL_INTERACTION) as InteractionLocalComponent;
    if (interactionComp && interactionComp.activeInteraction) {
      return false;
    }

    const newInteractions = this.getPossibleInteractions(entity);
    this.requestInteractionFromServer(newInteractions, entity);
    this.setupDefaultInteraction(newInteractions, entity);
    entity.addComponent(newInteractions);

    if (newInteractions.activeInteraction) {
      return false;
    }

    return true;
  }

  private requestInteractionFromServer(interactions: InteractionLocalComponent, entity: Entity) {

  }

  private setupDefaultInteraction(interactions: InteractionLocalComponent, entity: Entity) {
    const entityTypeComp = entity.getComponent(ComponentType.ENTITY_TYPE) as EntityTypeComponent;
    const entityType = entityTypeComp && entityTypeComp.entityType;
    const defaultInteraction = this.interactionCache.get(entityType);
    if (defaultInteraction) {
      interactions.activeInteraction = defaultInteraction;
    }
  }

  private getPossibleInteractions(entity: Entity): InteractionLocalComponent {
    const interactionComp = new InteractionLocalComponent(entity.id);
    const entityTypeComp = entity.getComponent(ComponentType.ENTITY_TYPE) as EntityTypeComponent;
    const entityType = entityTypeComp && entityTypeComp.entityType;
    if (!entityType) {
      return interactionComp;
    }

    switch (entityTypeComp.entityType) {
      case EntityType.BESTIA:
        interactionComp.possibleInteraction.add(InteractionType.ATTACK);
        break;
      case EntityType.ITEM:
        interactionComp.possibleInteraction.add(InteractionType.LOOT);
        break;
      case EntityType.OBJECT:
        // FIXME This is a test to implement the options rendering.
        // Replace this with the server request asap.
        interactionComp.possibleInteraction.add(InteractionType.READ);
        interactionComp.possibleInteraction.add(InteractionType.SPEAK);
        interactionComp.possibleInteraction.add(InteractionType.ATTACK);
        interactionComp.possibleInteraction.add(InteractionType.LOOT);
        break;
      default:
        LOG.info('Unknown entity type. No default interactions.');
    }

    return interactionComp;
  }

  public onClick(position: Px, clickedEntity?: Entity) {
    if (!clickedEntity) {
      return;
    }

    clickedEntity.addComponent(new SelectLocalComponent(clickedEntity.id));
  }

  public updatePosition(pointer: Px, entity?: Entity) {
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
