import { Topics } from 'Topics';
import { ComponentMessage } from 'message';
import { Component, ComponentType } from 'entities/components';
import { Point } from 'model';
import { Entity, EntityStore } from 'entities';

export class EntityPositionCache {

  private positionToEntity = new Map<string, number[]>();
  private entityToPosition = new Map<number, string>();

  constructor(
    private readonly entityStore: EntityStore
  ) {
    PubSub.subscribe(Topics.IO_RECV_COMP_MSG, (_, msg) => this.checkComponentUpdate(msg as ComponentMessage<Component>));
    PubSub.subscribe(Topics.IO_RECV_DEL_COMP_MSG, (_, msg) => this.checkComponentDelete(msg as ComponentMessage<Component>));
  }

  private checkComponentUpdate(msg: ComponentMessage<Component>) {
    if (msg.component.type !== ComponentType.POSITION) {
      return;
    }

    this.deleteOldEntity(msg.component.entityId);
  }

  private deleteOldEntity(entityId: number) {
    const spatialKey = this.entityToPosition.get(entityId);
    this.entityToPosition.delete(entityId);
    const updatedEntities = this.positionToEntity.get(spatialKey).filter((eid) => eid !== entityId);
    if (updatedEntities.length === 0) {
      this.positionToEntity.delete(spatialKey);
    } else {
      this.positionToEntity.set(spatialKey, updatedEntities);
    }
  }

  private checkComponentDelete(msg: ComponentMessage<Component>) {

  }

  private getEntitiesOnTile(position: Point): Entity[] {
    return [];
  }

  private pointToSpatialKey(position: Point): string {
    return `${position.x}-${position.y}`;
  }
}
