import { EntityStore, ComponentType, PositionComponent } from 'app/game/entities';
import { Point } from 'app/game/model';

export interface IMessage {
  mid: string;
}

export class Message<T extends ComponentMessage> {

  public componentName: string;
  public payoad: T;
  public latency: number;

  constructor() {
  }

  public updateModel(entityStore: EntityStore) {

  }
}

abstract class ComponentMessage {
  public readonly entityId: number;

  public abstract updateModel(entityStore: EntityStore);
}

class PositionComponentMessage extends ComponentMessage {
  public readonly shape: Point;
  public readonly sightBlocking: boolean;

  public updateModel(entityStore: EntityStore) {
    const entity = entityStore.getEntity(this.entityId);
    const component = entity.getComponent(ComponentType.POSITION) as PositionComponent;
    component.position = this.shape;
    component.isSightBlocked = this.sightBlocking;
  }
}

class MoveComponentMessage extends ComponentMessage {

  public readonly path: Point[];

  public updateModel(entityStore: EntityStore) {
    throw new Error('Method not implemented.');
  }
}
