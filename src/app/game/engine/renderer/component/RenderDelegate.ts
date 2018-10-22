import { Component, Entity } from 'app/game/entities';

export abstract class RenderDelegate<C extends Component> {

  public abstract rendersComponent(component: C): boolean;

  abstract hasNotSetup(entity: Entity, component: C): boolean;
  abstract createGameData(entity: Entity, component: C);
  abstract updateGameData(entity: Entity, component: C);
  public removeGameData(entity: Entity) { }
}
