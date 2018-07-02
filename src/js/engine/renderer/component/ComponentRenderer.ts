import { Component, ComponentType } from 'entities/components';
import { Entity } from 'entities';
import { Px } from 'model';

export abstract class ComponentRenderer<C extends Component> {

  constructor(
    protected readonly game: Phaser.Scene
  ) {

  }

  public render(entity: Entity, component: Component) {
    this.update();
    if (this.hasNotSetup(entity, component as C)) {
      this.createGameData(entity, component as C);
    } else {
      this.updateGameData(entity, component as C);
    }
  }

  /**
   * This function is guranteed to be called each tick in the game loop.
   */
  protected update() { }

  /**
   * The render must decide if there was a setup for this entity yet.
   */
  protected abstract hasNotSetup(entity: Entity, component: C): boolean;

  public abstract get supportedComponent(): ComponentType;

  protected abstract createGameData(entity: Entity, component: C);

  protected abstract updateGameData(entity: Entity, component: C);

  public removeGameData(entity: Entity) { }

  // Some neat helper functions
  protected getEntityPxPos(entity?: Entity): Px | null {
    if (!entity) {
      return null;
    }
    const sprite = entity.data.visual && entity.data.visual.sprite;
    if (!sprite) {
      return null;
    }

    return new Px(sprite.x, sprite.y);
  }
}
