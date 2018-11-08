import * as LOG from 'loglevel';

import { AccountInfo } from 'app/game/model/AccountInfo';
import { ComponentMessage, EngineEvents } from 'app/game/message';

import { EntityStore } from './EntityStore';
import { Entity } from './Entity';
import { ComponentType } from './components/ComponentType';
import { PlayerComponent } from './components/PlayerComponent';
import { MasterLocalComponent } from './components/local/MasterLocalComponent';
import { Component } from './components';

export class PlayerEntityHolder {

  private _activeEntityId = 0;

  public get activeEntity(): Entity | null {
    if (this._activeEntityId === 0) {
      return null;
    }
    return this.entityStore.getEntity(this._activeEntityId);
  }

  constructor(
    private readonly info: AccountInfo,
    private readonly entityStore: EntityStore
  ) {
    PubSub.subscribe(EngineEvents.IO_RECV_COMP_MSG, (_, msg) => this.checkEntity(msg));
  }

  private checkEntity(data: ComponentMessage<Component>) {
    if (data.component.type !== ComponentType.PLAYER) {
      return;
    }

    const playerComp = data.component as PlayerComponent;
    const isPlayerEntity = !!playerComp && playerComp.ownerAccountId === this.info.accountId;

    if (isPlayerEntity) {
      LOG.debug(`Found new player entity: ${playerComp.entityId}`);
      const playerEntity = this.entityStore.getEntity(playerComp.entityId);
      const masterComponent = new MasterLocalComponent(playerComp.entityId);
      playerEntity.addComponent(masterComponent);

      if (!this.activeEntity) {
        this._activeEntityId = playerComp.entityId;
      }

      PubSub.publish(EngineEvents.GAME_NEW_PLAYER_ENTITY, playerEntity);
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
    return this._activeEntityId === entity.id;
  }
}
