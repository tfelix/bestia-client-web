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

  private entityCounter = 0;
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
    this.entityStore.addComponent(visual);
    const position = new PositionComponent(
      this.componentCounter++,
      entity.id
    );
    position.position = pos;
    this.entityStore.addComponent(position);
    return entity;
  }

  public addPlayer(name: string, pos: Point): Entity {
    const entity = this.makeEntityWithSprite(name, pos);

    const entityTypeComp = new EntityTypeComponent(
      this.componentCounter++,
      entity.id
    );
    entityTypeComp.entityType = EntityType.PLAYER_BESTIA;
    this.entityStore.addComponent(entityTypeComp);

    const attackComp = new AttacksComponent(
      this.componentCounter++,
      entity.id
    );
    this.entityStore.addComponent(attackComp);

    const interactionCache = new InteractionCacheLocalComponent(
      entity.id
    );
    interactionCache.interactionCache.set(EntityType.BESTIA, InteractionType.ATTACK);
    this.entityStore.addComponent(interactionCache);

    const conditionComp = new ConditionComponent(
      this.componentCounter++,
      entity.id
    );
    conditionComp.currentHealth = 100;
    conditionComp.maxHealth = 100;
    conditionComp.currentMana = 0;
    conditionComp.maxMana = 0;
    this.entityStore.addComponent(attackComp);

    return entity;
  }

  public addBestia(name: string, pos: Point): Entity {
    const entity = this.makeEntityWithSprite(name, pos);
    const entityTypeComp = new EntityTypeComponent(
      this.componentCounter++,
      entity.id
    );
    entityTypeComp.entityType = EntityType.BESTIA;
    this.entityStore.addComponent(entityTypeComp);

    this.addConditionComponent(entity);

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
    this.entityStore.addComponent(visual);

    const position = new PositionComponent(
      this.componentCounter++,
      entity.id,
    );
    position.position = pos;
    this.entityStore.addComponent(position);

    return entity;
  }

  public addConditionComponent(entity: Entity, currentHealth: number = 100, maxHealth: number = 100) {
    const condComponent = new ConditionComponent(
      this.componentCounter++,
      entity.id
    );
    condComponent.maxHealth = maxHealth;
    condComponent.currentHealth = currentHealth;
    this.entityStore.addComponent(condComponent);
  }

  public addDebugComponent(entity: Entity) {
    const debugComp = new DebugComponent(
      this.componentCounter++,
      entity.id
    );
    this.entityStore.addComponent(debugComp);
  }

  public addPlayerComponent(entity: Entity, accountId: number) {
    const playerComp = new PlayerComponent(
      this.componentCounter++,
      entity.id,
      ComponentType.PLAYER,
      accountId
    );
    this.entityStore.addComponent(playerComp);
  }
}
