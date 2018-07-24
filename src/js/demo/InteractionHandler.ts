import { RequestInteractionMessage } from 'message/RequestInteractionMessage';
import { InteractionType, InteractionLocalComponent, EntityTypeComponent, ComponentType, EntityType } from 'entities/components';

import { ClientMessageHandler } from '.';
import { ServerEntityStore } from './ServerEntityStore';
import { Entity } from 'entities';

interface InteractionCallback {
  type: InteractionType;
  fn: () => void;
}

export class InteractionHandler extends ClientMessageHandler<RequestInteractionMessage> {

  private interactions = new Map<number, InteractionCallback>();

  constructor(
    private readonly entityStore: ServerEntityStore
  ) {
    super();
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
    const entity = this.entityStore.getEntity(msg.interactEntityId);
    if (!entity) {
      return;
    }
    const possibleInteraction = this.getPossibleInteraction(entity);
    const interactionComp = new InteractionLocalComponent(entity.id);
    possibleInteraction.forEach(inter => interactionComp.possibleInteraction.add(inter));
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

    const signEntity = this.entityStore.getEntityByIdentifier('sign_post');
    if (!signEntity) {
      return [];
    }

    return [InteractionType.READ];
  }
}
