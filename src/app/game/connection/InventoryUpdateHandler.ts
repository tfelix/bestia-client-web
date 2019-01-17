import { ComponentUpdaterHandler } from './ComponentUpdateHandler';
import { ComponentType } from '../entities/components/ComponentType';
import { ComponentDeleteMessage } from '../message/ComponentDeleteMessage';
import { ComponentMessage } from '../message/ComponentMessage';
import { Component } from '../entities/components/Component';
import { PlayerEntityHolder } from '../entities';

export class InventoryUpdateHandler implements ComponentUpdaterHandler {

  constructor(
    private readonly playerHolder: PlayerEntityHolder
  ) {
    // no op
  }

  public onComponentMessage(msg: ComponentMessage<Component>) {
    if (this.playerHolder.activeEntity.id !== msg.component.entityId) {
      return;
    }
  }

  updatesOnComponentType(): ComponentType[] {
    return [ComponentType.INVENTORY];
  }

  onComponentDeleteMessage(msg: ComponentDeleteMessage) {
    // no op.
  }
}
