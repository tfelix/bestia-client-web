import { Entity } from 'entities';
import { Action } from 'entities/actions';

export abstract class ActionsRenderer implements RenderStatistics {

  private lastUpdateTime: number = 0;

  public getLastUpdateTimeMs(): number {
    return this.lastUpdateTime;
  }
  constructor(
    protected readonly game: Phaser.Scene
  ) {
  }

  protected getActionsFromEntity<T>(entity: Entity, constructor: { new(...args: any[]): T }): T[] {
    return entity.actions.filter(x => x instanceof constructor) as T[];
  }

  public abstract needsUpdate(entity: Entity): boolean;
  public update(entity: Entity) {
    const startMs = new Date().getMilliseconds();
    this.doUpdate(entity);
    this.lastUpdateTime = new Date().getMilliseconds() - startMs;
  }

  protected abstract doUpdate(entity: Entity);

  public abstract getLastUpdateDetails(): [[string, number]];
}
