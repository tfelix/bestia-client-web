import * as LOG from 'loglevel';
import { Subject } from 'rxjs';

import { EntityStore, EntityUpdate, UpdateType } from './EntityStore';
import { Entity } from './Entity';
import { ComponentType } from './components/ComponentType';
import { PlayerComponent } from './components/PlayerComponent';
import { AccountInfo } from '../model/AccountInfo';
import { MasterLocalComponent } from './components/local/MasterLocalComponent';

export class PlayerEntityHolder {

  public activeEntity?: Entity;
  public masterEntity?: Entity;
  public ownedEntities: Entity[] = [];

  public readonly onNewActiveEntity = new Subject<Entity>();
  public readonly onNewMasterEntity = new Subject<Entity>();
  public readonly onEntitiesChanged = new Subject<Entity[]>();

  constructor(
    private readonly info: AccountInfo,
    private readonly entityStore: EntityStore
  ) {
    entityStore.onUpdateEntity.subscribe(x => this.checkEntity(x));
  }

  private addEntity(entity: Entity) {
    if (this.ownedEntities.find(x => x.id === entity.id)) {
      return;
    }

    this.ownedEntities.push(entity);
    this.onEntitiesChanged.next(this.ownedEntities);
  }

  private checkEntity(data: EntityUpdate) {
    if (data.changedComponentType !== ComponentType.PLAYER) {
      return;
    }

    const playerComp = data.entity.getComponent(ComponentType.PLAYER) as PlayerComponent;
    const isPlayerEntity = !!playerComp && playerComp.ownerAccountId === this.info.accountId;

    if (isPlayerEntity) {
      LOG.debug(`Found new player entity: ${data.entity.id}`);
      this.masterEntity = data.entity;
      // TODO Das hier in eine factory auslagern.
      const masterComponent = new MasterLocalComponent(data.entity.id);
      this.entityStore.addComponent(masterComponent);

      if (!this.activeEntity) {
        this.activeEntity = data.entity;
      }
    }
  }

  public isPlayerEntity(entity?: Entity): boolean {
    if (!entity) {
      return false;
    }
    return this.activeEntity && this.activeEntity.id === entity.id;
  }
}
