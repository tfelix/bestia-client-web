import { Entity, Action } from 'entities';

export abstract class ActionsRenderer implements RenderStatistics {
  private lastUpdateTime = 0;
  constructor(
    protected readonly game: Phaser.Scene
  ) {
  }

  public getLastUpdateTimeMs(): number {
    return this.lastUpdateTime;
  }

  protected getActionsFromEntity<T extends Action>(entity: Entity, constructor: { new(...args: any[]): T }): T[] {
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
