import { Point } from 'app/game/model';
import {
  PlayerComponent, Component, ComponentType, ConditionComponent, VisualComponent,
  DebugComponent, PositionComponent, AttacksComponent, Entity, InventoryComponent,
  FxComponent, FishingComponent, ProjectileComponent, EntityTypeComponent, EntityType, BuildingComponent, Item, VegetationComponent
} from 'app/game/entities';
import { SpriteType } from 'app/game/engine';

import { ServerEntityStore } from './ServerEntityStore';

export type BuildingData = Array<Array<{
  outer: string,
  inner: string
}>>;

export class EntityLocalFactory {
  private entityCounter = 1;
  private componentCounter = 0;
  private lastInsertedEntityId = 0;
  private lastInsertedItemId = 0;

  constructor(
    private readonly entityStore: ServerEntityStore
  ) {
  }

  public getLastInsertedEntityId(): number {
    return this.lastInsertedEntityId;
  }

  public createEntity(specialId?: number): Entity {
    const newEntityId = specialId || this.entityCounter++;
    this.lastInsertedEntityId = newEntityId;
    return this.entityStore.getEntity(newEntityId);
  }

  public addSprite(entity: Entity, name: string, pos: Point): Component[] {
    const visual = new VisualComponent(
      this.componentCounter++,
      entity.id,
      true,
      name,
      SpriteType.MULTI
    );
    visual.animation = 'stand_down';
    entity.addComponent(visual);
    const position = new PositionComponent(
      this.componentCounter++,
      entity.id
    );
    position.position = pos;
    entity.addComponent(position);

    return [visual, position];
  }

  public addPlayer(name: string, pos: Point, accountId: number): Component[] {
    const entity = this.createEntity();
    const spriteComp = this.addSprite(entity, name, pos);

    const entityTypeComp = new EntityTypeComponent(
      this.componentCounter++,
      entity.id
    );
    entityTypeComp.entityType = EntityType.PLAYER;
    entity.addComponent(entityTypeComp);

    const attackComp = new AttacksComponent(
      this.componentCounter++,
      entity.id
    );
    entity.addComponent(attackComp);

    const conditionComp = new ConditionComponent(
      this.componentCounter++,
      entity.id
    );
    conditionComp.currentHealth = 100;
    conditionComp.maxHealth = 100;
    conditionComp.currentMana = 0;
    conditionComp.maxMana = 0;
    entity.addComponent(attackComp);

    const playerComp = new PlayerComponent(
      this.componentCounter++,
      entity.id,
      ComponentType.PLAYER,
      accountId
    );
    entity.addComponent(playerComp);

    const inventoryComp = new InventoryComponent(
      this.componentCounter++,
      entity.id
    );
    inventoryComp.maxItems = 100;
    inventoryComp.maxWeight = 20;
    entity.addComponent(inventoryComp);

    return [
      ...spriteComp,
      entityTypeComp,
      attackComp,
      conditionComp,
      playerComp,
      inventoryComp
    ];
  }

  public addBuilding2(data: BuildingData, pos: Point): Component[] {
    const components: Component[] = [];
    const componentMap: BuildingComponent[][] = [];

    for (let y = 0; y < data.length; y++) {
      componentMap[y] = [];
      for (let x = 0; x < data[y].length; x++) {
        const entity = this.createEntity();
        const buildingComp = new BuildingComponent(
          this.componentCounter++,
          entity.id
        );
        componentMap[y].push(buildingComp);
        buildingComp.spriteSheet = 'simple_cabin_1';
        buildingComp.innerSprite = data[y][x].inner;
        buildingComp.outerSprite = data[y][x].outer;

        const posComp = new PositionComponent(
          this.componentCounter++,
          entity.id
        );
        posComp.isSightBlocked = true;
        posComp.position = new Point(pos.x + 3 * x, pos.y + 3 * y);

        components.push(buildingComp);
        components.push(posComp);
      }
    }

    // Add the references in the components
    for (let y = 0; y < componentMap.length; y++) {
      for (let x = 0; x < componentMap[y].length; x++) {
        const currentComp = componentMap[y][x];

        let top = null;
        let left = null;
        if (y > 0) {
          top = componentMap[y - 1][x].entityId;
          componentMap[y - 1][x].connectedEntityIds.bottom = currentComp.entityId;
        }
        if (x > 0) {
          left = componentMap[y][x - 1].entityId;
          componentMap[y][x - 1].connectedEntityIds.right = currentComp.entityId;
        }

        currentComp.connectedEntityIds = {
          top: top,
          left: left,
          right: null,
          bottom: null
        };
      }
    }

    return components;
  }

  public addFishingComponent(playerEntityId: number): FishingComponent {
    const fishingComp = new FishingComponent(
      this.componentCounter++,
      playerEntityId
    );
    fishingComp.seed = 123;

    this.entityStore
      .getEntity(playerEntityId)
      .addComponent(fishingComp);

    return fishingComp;
  }

  public addBestia(name: string, pos: Point): Component[] {
    const entity = this.createEntity();
    const entityTypeComp = new EntityTypeComponent(
      this.componentCounter++,
      entity.id
    );
    entityTypeComp.entityType = EntityType.MOB;
    entity.addComponent(entityTypeComp);

    return [
      entityTypeComp,
      ...this.addConditionComponent(entity),
      ...this.addSprite(entity, name, pos)
    ];
  }

  public addItemEmptyBottle(
    pos: Point
  ): Component[] {
    const entity = this.createEntity();
    this.entityStore.addEntity(entity);
    const visual = new VisualComponent(
      this.componentCounter++,
      entity.id,
      true,
      'empty_bottle',
      SpriteType.ITEM
    );
    entity.addComponent(visual);

    const position = new PositionComponent(
      this.componentCounter++,
      entity.id
    );
    position.position = pos;
    entity.addComponent(position);

    const entityTypeComp = new EntityTypeComponent(
      this.componentCounter++,
      entity.id
    );
    entityTypeComp.entityType = EntityType.ITEM;
    entity.addComponent(entityTypeComp);

    const inventoryComp = new InventoryComponent(
      this.componentCounter++,
      entity.id
    );

    inventoryComp.items.push(new Item(
      1,
      this.lastInsertedItemId++,
      'empty_bottle',
      'empty_bottle.png',
      0.1,
      1
    ));
    entity.addComponent(inventoryComp);

    return [visual, position, entityTypeComp, inventoryComp];
  }

  public addItemKnife(
    pos: Point
  ): Component[] {
    const entity = this.createEntity();
    this.entityStore.addEntity(entity);

    const visual = new VisualComponent(
      this.componentCounter++,
      entity.id,
      true,
      'knife',
      SpriteType.ITEM
    );
    entity.addComponent(visual);

    const position = new PositionComponent(
      this.componentCounter++,
      entity.id
    );
    position.position = pos;
    entity.addComponent(position);

    const entityTypeComp = new EntityTypeComponent(
      this.componentCounter++,
      entity.id
    );
    entityTypeComp.entityType = EntityType.ITEM;
    entity.addComponent(entityTypeComp);

    const inventoryComp = new InventoryComponent(
      this.componentCounter++,
      entity.id
    );

    inventoryComp.items.push(new Item(
      2,
      this.lastInsertedItemId++,
      'knife',
      'knife.png',
      0.5,
      1
    ));
    entity.addComponent(inventoryComp);

    return [visual, position, entityTypeComp, inventoryComp];
  }

  public addPlant(name: string, pos: Point): Component[] {
    const entity = this.createEntity(this.entityCounter++);
    this.entityStore.addEntity(entity);

    const vegetation = new VegetationComponent(
      this.componentCounter++,
      entity.id,
    );
    vegetation.hullPoints = [
      new Point(0, 0),
      new Point(2, 0),
      new Point(2, 2),
      new Point(0, 2)
    ];
    vegetation.overlaySprite = 'mask_1';
    vegetation.spriteSheet = name;
    entity.addComponent(vegetation);

    const position = new PositionComponent(
      this.componentCounter++,
      entity.id,
    );
    position.position = pos;
    entity.addComponent(position);

    return [vegetation, position];
  }

  public addObject(name: string, pos: Point, givenEntityId?: number): Component[] {
    const entity = this.createEntity(givenEntityId);
    this.entityStore.addEntity(entity);

    const visual = new VisualComponent(
      this.componentCounter++,
      entity.id,
      true,
      name,
      SpriteType.SIMPLE
    );
    entity.addComponent(visual);

    const position = new PositionComponent(
      this.componentCounter++,
      entity.id,
    );
    position.position = pos;
    entity.addComponent(position);

    // const debug = this.addDebugComponent(entity);
    return [visual, position];
  }

  public addConditionComponent(
    entity: Entity,
    currentHealth: number = 100,
    maxHealth: number = 100
  ): Component[] {
    const condComponent = new ConditionComponent(
      this.componentCounter++,
      entity.id
    );
    condComponent.maxHealth = maxHealth;
    condComponent.currentHealth = currentHealth;
    entity.addComponent(condComponent);
    return [condComponent];
  }

  addProjectileComponent(entity: Entity, pos: Point): Component[] {
    const projectileComp = new ProjectileComponent(
      this.componentCounter++,
      entity.id
    );
    projectileComp.projectileName = 'Arrow_01';
    projectileComp.speed = 20;
    entity.addComponent(projectileComp);

    const posComp = new PositionComponent(
      this.componentCounter++,
      entity.id
    );
    posComp.position = pos;
    return [projectileComp, posComp];
  }

  public addDebugComponent(entity: Entity): Component[] {
    const debugComp = new DebugComponent(
      this.componentCounter++,
      entity.id
    );
    entity.addComponent(debugComp);
    return [debugComp];
  }

  addFx(entity: Entity): Component[] {
    const fxComp = new FxComponent(
      this.componentCounter++,
      entity.id
    );
    entity.addComponent(fxComp);
    return [fxComp];
  }
}
