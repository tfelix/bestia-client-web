import { Component } from './Component';
import { ComponentType } from './ComponentType';
import { EntityStore } from '../EntityStore';

export class BuildingComponent extends Component {

  public spriteSheet: string;
  public innerSprite: string;
  public outerSprite: string | null;

  public connectedEntityIds: {
    top: number | null,
    right: number | null,
    bottom: number | null,
    left: number | null
  };

  constructor(
    id: number,
    entityId: number
  ) {
    super(id, entityId, ComponentType.BUILDING);
  }

  get jsonDescriptionName() {
    return this.spriteSheet + '_desc';
  }

  public findAllConnectedEntityIds(entityStore: EntityStore): number[] {
    const connectedEntityIds = new Set<number>();
    this.traverseConnectedEntities(entityStore, this, connectedEntityIds);

    return Array.from(connectedEntityIds);
  }

  private traverseConnectedEntities(
    entityStore: EntityStore,
    building: BuildingComponent,
    searchedEntities: Set<number>
  ) {
    const entity = entityStore.getEntity(building.entityId);
    if (searchedEntities.has(building.entityId)) {
      return;
    }

    searchedEntities.add(building.entityId);

    const toCheckEids = [
      building.connectedEntityIds.top || 0,
      building.connectedEntityIds.bottom || 0,
      building.connectedEntityIds.left || 0,
      building.connectedEntityIds.right || 0
    ].filter(x => {
      if (x === 0) {
        return false;
      }
      // During initilizaion there might be race conditions that not all connected entities are already
      // loaded. Simply skip them.
      if (entity.hasComponent(ComponentType.BUILDING)) {
        return true;
      }

      return false;
    });

    toCheckEids.forEach(eid => {
      const nextEntity = entityStore.getEntity(eid);
      const nextBuilding = nextEntity.getComponent(ComponentType.BUILDING) as BuildingComponent;
      // When traversing the graph sometimes during init of components
      // some entities might not have the building componet yet.
      if (!nextBuilding) {
        return;
      }
      this.traverseConnectedEntities(entityStore, nextBuilding, searchedEntities);
    });
  }
}
