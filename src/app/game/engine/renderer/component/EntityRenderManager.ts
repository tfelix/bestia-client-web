import { Component, ComponentType, HighlightComponent, FishingComponent } from 'app/game/entities';

import { ComponentRenderer } from './ComponentRenderer';
import { VisualComponentRenderer } from './VisualComponentRenderer';
import { DebugComponentRenderer } from './DebugComponentRenderer';
import { MoveComponentRenderer } from './MoveComponentRenderer';
import { ConditionComponentRenderer } from './ConditionComponentRenderer';
import { MasterLocalComponentRenderer } from './local/MasterLocalComponentRenderer';
import { EngineContext } from '../../EngineContext';
import { PerformComponentRenderer } from './PerformComponentRenderer';
import { InventoryComponentRenderer } from './InventoryComponentRenderer';
import { SelectLocalComponentRenderer } from './local/SelectLocalComponentRenderer';
import { SubFxComponentRenderer } from './SubFxComponentRenderer';
import { HighlightLocalComponentRenderer } from './local/HighlightLocalComponentRenderer';
import { FishingComponentRenderer } from './FishingComponetRenderer';
import { ProjectileComponentRenderer } from './ProjectileComponentRenderer';
import { BuildingComponentRenderer } from './BuildingComponentRenderer';

/**
 * The Actions, Common and EntityRenderManager are fairly identically and could be unified.
 */
export class EntityRenderManager {

  private componentRenderer = new Map<ComponentType, ComponentRenderer<Component>>();

  constructor(
    private readonly context: EngineContext
  ) {
    this.addComponentRenderer(new VisualComponentRenderer(context));
    this.addComponentRenderer(new DebugComponentRenderer(context.gameScene));
    this.addComponentRenderer(new MoveComponentRenderer(context));
    this.addComponentRenderer(new ConditionComponentRenderer(context));
    this.addComponentRenderer(new PerformComponentRenderer(context));
    this.addComponentRenderer(new InventoryComponentRenderer(context));
    this.addComponentRenderer(new SubFxComponentRenderer(context));
    this.addComponentRenderer(new FishingComponentRenderer(context));
    this.addComponentRenderer(new ProjectileComponentRenderer(context));
    this.addComponentRenderer(new BuildingComponentRenderer(context));

    // Local Component Renderer.
    this.addComponentRenderer(new MasterLocalComponentRenderer(context));
    this.addComponentRenderer(new SelectLocalComponentRenderer(context));
    this.addComponentRenderer(new HighlightLocalComponentRenderer(context));
  }

  private addComponentRenderer(renderer: ComponentRenderer<Component>) {
    this.componentRenderer.set(renderer.supportedComponent, renderer);
  }

  public create() {
    this.componentRenderer.forEach(r => r.create());
  }

  public update() {
    for (const e of this.context.entityStore.entities.values()) {
      e.removedComponentTypes.forEach(rc => {
        const renderer = this.componentRenderer.get(rc);
        if (renderer) {
          renderer.removeGameData(e);
        }
      });
      e.removedComponentTypes.clear();
      for (const c of e.getComponentIterator()) {
        const renderer = this.componentRenderer.get(c.type);
        if (renderer) {
          renderer.render(e, c);
        }
      }
    }
  }
}
