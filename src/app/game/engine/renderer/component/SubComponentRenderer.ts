import { Component, Entity } from 'app/game/entities';
import { ComponentRenderer } from './ComponentRenderer';
import { RenderDelegate } from './RenderDelegate';

/**
 * Some components might be rather complex to render. In order to add one more layer of delegation
 * this SubComponentRenderer exists. For example the FxComponent is rather complex and needs various
 * different renderer for its specific effects. For each kind of effect another sub component renderer
 * might get attached and rendering its special effect.
 */
export abstract class SubComponentRenderer<C extends Component> extends ComponentRenderer<C> {

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
    // this is not needed as this class has a own render method.
  }

  protected updateGameData(entity: Entity, component: C) {
    // this is not needed as this calss has a own render method.
  }
}
