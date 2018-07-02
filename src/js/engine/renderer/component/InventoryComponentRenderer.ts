import { ComponentRenderer } from '.';
import { InventoryComponent, ComponentType } from 'entities/components';
import { Entity } from 'entities';
import { EngineContext } from '../../EngineContext';

let lastItemCount = 0;

export class InventoryComponentRenderer extends ComponentRenderer<InventoryComponent> {

  constructor(
    private readonly ctx: EngineContext
  ) {
    super(ctx.game);
  }

  get supportedComponent(): ComponentType {
    return ComponentType.INVENTORY;
  }

  protected hasNotSetup(entity: Entity, component: InventoryComponent): boolean {
    return lastItemCount < component.items.length;
  }

  protected createGameData(entity: Entity, component: InventoryComponent) {
    alert('Player has picked up: ' + component.items[component.items.length - 1].name);
    lastItemCount = component.items.length;
  }

  protected updateGameData(entity: Entity, component: InventoryComponent) {

  }
}
