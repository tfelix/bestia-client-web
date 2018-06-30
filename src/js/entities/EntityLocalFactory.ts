import { Entity, EntityStore } from '.';
import {
  VisualComponent, SpriteType, PositionComponent, PlayerComponent,
  ComponentType, DebugComponent
} from './components';
import { Point } from 'model';
import { ConditionComponent } from './components/ConditionComponent';
import { EntityTypeComponent, EntityType } from './components/EntityTypeComponent';
import { AttacksComponent } from './components/AttacksComponent';
import { InteractionCacheLocalComponent, InteractionType } from './components/local/InteractionCacheLocalComponent';

export class EntityLocalFactory {

  private entityCounter = 1;
  private componentCounter = 0;

  constructor(
    private readonly entityStore: EntityStore
  ) {

  }

  public createEntity(): Entity {
    return this.entityStore.getEntity(this.entityCounter++);
  }

  private makeEntityWithSprite(name: string, pos: Point): Entity {
    const entity = this.createEntity();
    this.entityStore.addEntity(entity);
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
    return entity;
  }

  public addPlayer(name: string, pos: Point): Entity {
    const entity = this.makeEntityWithSprite(name, pos);

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

    const interactionCache = new InteractionCacheLocalComponent(
      entity.id
    );
    interactionCache.interactionCache.set(EntityType.BESTIA, InteractionType.ATTACK);
    entity.addComponent(interactionCache);

    const conditionComp = new ConditionComponent(
      this.componentCounter++,
      entity.id
    );
    conditionComp.currentHealth = 100;
    conditionComp.maxHealth = 100;
    conditionComp.currentMana = 0;
    conditionComp.maxMana = 0;
    entity.addComponent(attackComp);

    return entity;
  }

  public addBestia(name: string, pos: Point): Entity {
    const entity = this.makeEntityWithSprite(name, pos);
    const entityTypeComp = new EntityTypeComponent(
      this.componentCounter++,
      entity.id
    );
    entityTypeComp.entityType = EntityType.BESTIA;
    entity.addComponent(entityTypeComp);

    this.addConditionComponent(entity);

    return entity;
  }

  public addItem(name: string, amount: number, pos: Point): Entity {
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

    return entity;
  }

  public addObject(name: string, pos: Point): Entity {
    const entity = this.createEntity();
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

    return entity;
  }

  public addConditionComponent(entity: Entity, currentHealth: number = 100, maxHealth: number = 100) {
    const condComponent = new ConditionComponent(
      this.componentCounter++,
      entity.id
    );
    condComponent.maxHealth = maxHealth;
    condComponent.currentHealth = currentHealth;
    entity.addComponent(condComponent);
  }

  public addDebugComponent(entity: Entity) {
    const debugComp = new DebugComponent(
      this.componentCounter++,
      entity.id
    );
    entity.addComponent(debugComp);
  }

  public addPlayerComponent(entity: Entity, accountId: number) {
    const playerComp = new PlayerComponent(
      this.componentCounter++,
      entity.id,
      ComponentType.PLAYER,
      accountId
    );
    entity.addComponent(playerComp);
  }
}
