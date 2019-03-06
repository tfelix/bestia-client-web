import { EntityStore, ComponentType } from 'app/game/entities';
import { ComponentMessage, ComponentDeleteMessage, EngineEvents } from 'app/game/message';
import { Component } from 'app/game/entities';
import { ComponentUpdaterHandler } from './update-handler/ComponentUpdateHandler';

export class ComponentUpdater {

  private componentUpdateHandler: Map<ComponentType, ComponentUpdaterHandler[]> = new Map();

  constructor(
    private readonly entityStore: EntityStore
  ) {
    PubSub.subscribe(EngineEvents.IO_RECV_COMP_MSG, (_, msg) => this.onComponentMessage(msg));
    PubSub.subscribe(EngineEvents.IO_RECV_DEL_COMP_MSG, (_, msg) => this.onComponentDeleteMessage(msg));
  }

  public addUpdater(updater: ComponentUpdaterHandler) {
    updater.updatesOnComponentType().forEach(ct => {
      if (!this.componentUpdateHandler.has(ct)) {
        this.componentUpdateHandler.set(ct, []);
      }

      this.componentUpdateHandler.get(ct).push(updater);
    });
  }

  private onComponentMessage(msg: ComponentMessage<Component>) {
    const entity = this.entityStore.getEntity(msg.component.entityId);
    if (entity) {
      entity.addComponent(msg.component);
    }

    const handler = this.componentUpdateHandler.get(msg.component.type) || [];
    handler.forEach(h => {
      h.onComponentMessage(msg);
    });
  }

  private onComponentDeleteMessage(msg: ComponentDeleteMessage) {
    const entity = this.entityStore.getEntity(msg.entityId);
    if (entity) {
      entity.removeComponentByType(msg.componentType);
    }

    const handler = this.componentUpdateHandler.get(msg.componentType) || [];
    handler.forEach(h => {
      h.onComponentDeleteMessage(msg);
    });
  }
}
