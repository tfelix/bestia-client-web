import { Component, Entity } from 'app/game/entities';
import { ComponentRenderer } from './ComponentRenderer';
import { RenderDelegate } from './RenderDelegate';

/**
 * Sub-Renderer can be attached to this class and the component gets filtered and each sub-component
 * renderer gets the delegate to render its component on its own.
 */
export abstract class DelegateComponentRenderer<C extends Component> extends ComponentRenderer<C> {

  private subRenderer: RenderDelegate<C>[] = [];

  protected addSubRenderer(renderer: RenderDelegate<C>) {
    this.subRenderer.push(renderer);
  }

  public render(entity: Entity, component: Component) {

    this.subRenderer.forEach(sr => {
      if (sr.hasNotSetup(entity, component as C)) {
        sr.createGameData(entity, component as C);
      } else {
        sr.updateGameData(entity, component as C);
      }
    });
  }

  protected hasNotSetup(entity: Entity, component: C): boolean {
    return this.subRenderer.findIndex(x => x.hasNotSetup(entity, component)) !== -1;
  }

  protected createGameData(entity: Entity, component: C) {
    // this is not called as this class has a own render method.
  }

  protected updateGameData(entity: Entity, component: C) {
    // this is not called as this calss has a own render method.
  }
}
