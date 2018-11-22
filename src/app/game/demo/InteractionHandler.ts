import { RequestInteractionMessage } from 'app/game/message';
import {
  InteractionType, InteractionLocalComponent, EntityTypeComponent, ComponentType, EntityType,
  Entity
} from 'app/game/entities';

import { ClientMessageHandler } from './ClientMessageHandler';
import { ServerEntityStore } from './ServerEntityStore';

interface InteractionCallback {
  type: InteractionType;
  fn: () => void;
}

export class InteractionHandler extends ClientMessageHandler<RequestInteractionMessage> {

  private interactions = new Map<number, InteractionCallback>();

  constructor(
    entityStore: ServerEntityStore
  ) {
    super(entityStore);
  }

  public registerInteraction(entityId: number, type: InteractionType, handlerFn: () => void) {
    this.interactions.set(entityId, {
      type: type,
      fn: handlerFn
    });
  }

  public isHandlingMessage(msg: any): boolean {
    return msg instanceof RequestInteractionMessage;
  }

  public handle(msg: RequestInteractionMessage) {
    const entity = this.serverEntities.getEntity(msg.interactEntityId);
    if (!entity) {
      return;
    }
    const possibleInteraction = this.getPossibleInteraction(entity);
    const interactionComp = new InteractionLocalComponent(entity.id);
    possibleInteraction.forEach(inter => interactionComp.possibleInteractions.add(inter));
    this.sendAllComponents([interactionComp]);
  }

  private getPossibleInteraction(entity: Entity): InteractionType[] {
    const typeComponent = entity.getComponent(ComponentType.ENTITY_TYPE) as EntityTypeComponent;

    switch (typeComponent.entityType) {
      case EntityType.BESTIA:
        return [InteractionType.ATTACK];
      case EntityType.ITEM:
        return [InteractionType.LOOT, InteractionType.ATTACK];
      case EntityType.NPC:
        return [InteractionType.SPEAK, InteractionType.ATTACK];
      default:
    }

    const signEntity = this.serverEntities.getEntityByIdentifier('sign_post');
    if (signEntity && signEntity.id === entity.id) {
      return [InteractionType.READ];
    }

    return [];
  }
}
