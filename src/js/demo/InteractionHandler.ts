import { RequestInteractionMessage } from 'message/RequestInteractionMessage';
import { InteractionType, InteractionLocalComponent } from 'entities/components';

import { ClientMessageHandler } from '.';
import { ServerEntityStore } from './ServerEntityStore';
import { Entity } from 'entities';

interface InteractionCallback {
	type: InteractionType;
	fn: () => void
}

export class InteractionHandler extends ClientMessageHandler<RequestInteractionMessage> {

	private interactions = new Map<Number, InteractionCallback>();

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
		const signEntity = this.entityStore.getEntityByIdentifier('sign_post');
		if (!signEntity) {
			return;
		}

		return [InteractionType.READ];
	}
}