import { Point, Item } from 'app/game/model';
import {
  PlayerComponent, Component, ComponentType, ConditionComponent, VisualComponent,
  DebugComponent, PositionComponent, EntityTypeComponent, EntityType,
  AttacksComponent, Entity, InventoryComponent
} from 'app/game/entities';
import { SpriteType } from 'app/game/engine';

import { ServerEntityStore } from './ServerEntityStore';

export class EntityLocalFactory {

  private entityCounter = 1;
  private componentCounter = 0;
  private lastInsertedEntityId = 0;

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
    entityTypeComp.entityType = EntityType.PLAYER_BESTIA;
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

  public addBestia(name: string, pos: Point): Component[] {
    const entity = this.createEntity();
    const entityTypeComp = new EntityTypeComponent(
      this.componentCounter++,
      entity.id
    );
    entityTypeComp.entityType = EntityType.BESTIA;
    entity.addComponent(entityTypeComp);

    return [
      entityTypeComp,
      ...this.addConditionComponent(entity),
      ...this.addSprite(entity, name, pos)
    ];
  }

  public addItem(
    name: string,
    amount: number, pos: Point
  ): Component[] {
    const entity = this.createEntity();
    this.entityStore.addEntity(entity);
    const visual = new VisualComponent(
      this.componentCounter++,
      entity.id,
      true,
      name,
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
    inventoryComp.items.push(new Item(1, 2, name, 1));
    entity.addComponent(inventoryComp);

    return [visual, position, entityTypeComp, inventoryComp];
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

    const type = new EntityTypeComponent(
      this.componentCounter++,
      entity.id
    );
    type.entityType = EntityType.OBJECT;
    entity.addComponent(type);

    return [visual, position, type];
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

  public addDebugComponent(entity: Entity): Component[] {
    const debugComp = new DebugComponent(
      this.componentCounter++,
      entity.id
    );
    entity.addComponent(debugComp);
    return [debugComp];
  }
}
