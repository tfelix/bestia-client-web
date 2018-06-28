import { Component, ComponentType } from 'entities/components';
import { ComponentRenderer } from './ComponentRenderer';
import { VisualComponentRenderer } from './VisualComponentRenderer';
import { DebugComponentRenderer } from './DebugComponentRenderer';
import { MoveComponentRenderer } from './MoveComponentRenderer';
import { ConditionComponentRenderer } from './ConditionComponentRenderer';
import { MasterLocalComponentRenderer } from './local/MasterLocalComponentRenderer';
import { EngineContext } from '../../EngineContext';
import { PerformComponentRenderer } from './PerformComponentRenderer';

export class EntityRenderManager {

  private componentRenderer = new Map<ComponentType, ComponentRenderer<Component>>();

  constructor(
    private readonly context: EngineContext
  ) {
    this.addComponentRenderer(new VisualComponentRenderer(this.context));
    this.addComponentRenderer(new DebugComponentRenderer(this.context.game));
    this.addComponentRenderer(new MoveComponentRenderer(context));
    this.addComponentRenderer(new ConditionComponentRenderer(context));
    this.addComponentRenderer(new PerformComponentRenderer(this.context));

    // Local Component Renderer.
    this.addComponentRenderer(new MasterLocalComponentRenderer(context));
  }

  private addComponentRenderer(renderer: ComponentRenderer<Component>) {
    this.componentRenderer.set(renderer.supportedComponent, renderer);
  }

  public update() {
    for (const e of this.context.entityStore.entities.values()) {
      for (const c of e.getComponentIterator()) {
        const renderer = this.componentRenderer.get(c.type);
        if (renderer) {
          renderer.render(e, c);
        }
      }
      for (const rc of e.removedComponentTypes) {
        const renderer = this.componentRenderer.get(rc);
        if (renderer) {
          renderer.removeGameData(e);
        }
      }
    }
  }
}
