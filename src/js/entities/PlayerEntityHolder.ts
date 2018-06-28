import * as LOG from 'loglevel';
import { Subject } from 'rxjs';

import { EntityStore } from './EntityStore';
import { Entity } from './Entity';
import { ComponentType } from './components/ComponentType';
import { PlayerComponent } from './components/PlayerComponent';
import { AccountInfo } from '../model/AccountInfo';
import { MasterLocalComponent } from './components/local/MasterLocalComponent';
import { Topics } from 'Topics';
import { ComponentMessage } from 'message';
import { Component } from './components';

export class PlayerEntityHolder {

  private _activeEntityId = 0;

  public get activeEntity(): Entity | null {
    return this.entityStore.getEntity(this._activeEntityId);
  }

  constructor(
    private readonly info: AccountInfo,
    private readonly entityStore: EntityStore
  ) {
    PubSub.subscribe(Topics.IO_RECV_COMP_MSG, (_, msg) => this.checkEntity(msg));
  }

  private checkEntity(data: ComponentMessage<Component>) {
    if (data.component.type !== ComponentType.PLAYER) {
      return;
    }

    const playerComp = data.component as PlayerComponent;
    const isPlayerEntity = !!playerComp && playerComp.ownerAccountId === this.info.accountId;

    if (isPlayerEntity) {
      const masterComponent = new MasterLocalComponent(playerComp.entityId);
      this.entityStore.addComponent(masterComponent);

      if (!this.activeEntity) {
        this._activeEntityId = playerComp.entityId;
      }
    }
  }

  /**
   * Helper method
   * @param entity Entity to check if this is the active player entity.
   */
  public isActivePlayerEntity(entity?: Entity): boolean {
    if (!entity) {
      return false;
    }
    return this.activeEntity && this.activeEntity.id === entity.id;
  }
}
