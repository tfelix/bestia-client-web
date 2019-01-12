import { Component } from './Component';
import { ComponentType } from './ComponentType';
import { EntityStore } from '../EntityStore';

export class ConnectedBuildingComponentFinder {

  constructor(
    private readonly entityStore: EntityStore
  ) {
  }

  public findAllConnectedEntityIds(building: BuildingComponent): number[] {
    const connectedEntityIds = new Set<number>();
    this.traverseConnectedEntities(building, connectedEntityIds);

    return Array.from(connectedEntityIds);
  }

  private traverseConnectedEntities(building: BuildingComponent, searchedEntities: Set<number>) {
    const entity = this.entityStore.getEntity(building.entityId);
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
      const nextEntity = this.entityStore.getEntity(eid);
      const nextBuilding = nextEntity.getComponent(ComponentType.BUILDING) as BuildingComponent;
      this.traverseConnectedEntities(nextBuilding, searchedEntities);
    });
  }
}

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
}
