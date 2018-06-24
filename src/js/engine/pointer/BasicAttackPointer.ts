import * as LOG from 'loglevel';
import * as PubSub from 'pubsub-js';

import { Pointer } from './Pointer';
import { PointerManager } from './PointerManager';
import { EngineContext } from '../EngineContext';
import { PointerPriority } from './PointerPriority';
import { Px, Point } from 'model';
import { Entity, PlayerEntityHolder } from 'entities';
import { ComponentType, PositionComponent, VisualComponent } from 'entities/components';
import { EntityTypeComponent, EntityType } from 'entities/components/EntityTypeComponent';
import { InteractionCacheLocalComponent, InteractionType } from 'entities/components/local/InteractionCacheLocalComponent';
import { AttacksComponent } from 'entities/components/AttacksComponent';
import { BasicAttackMessage } from 'message/BasicAttackMessage';
import { Topics } from 'Topics';
import { ConditionComponent, ConditionHelper } from 'entities/components/ConditionComponent';
import { MapHelper } from 'map';

function getSightDirection(source: Point, lookingTo: Point): Point {
  return lookingTo.minus(source).norm();
}

export class BasicAttackPointer extends Pointer {

  private activeSprite: Phaser.GameObjects.Sprite;
  private playerHolder: PlayerEntityHolder;

  constructor(
    manager: PointerManager,
    ctx: EngineContext
  ) {
    super(manager, ctx);

    this.playerHolder = ctx.playerHolder;
  }

  public allowOverwrite(): boolean {
    return true;
  }

  public checkActive(pointer: Px, entity?: Entity): number {
    if (!entity) {
      return PointerPriority.NONE;
    }

    if (!this.isAttackable(entity)) {
      return PointerPriority.NONE;
    }

    return PointerPriority.BASIC_ATTACK;
  }

  private isAttackable(entity: Entity): boolean {
    const playerActive = this.playerHolder.activeEntity;
    if (!playerActive) {
      return false;
    }

    const interactionCache = playerActive.getComponent(ComponentType.LOCAL_INTERACTION_CACHE) as InteractionCacheLocalComponent;
    const entityTypeComp = entity.getComponent(ComponentType.ENTITY_TYPE) as EntityTypeComponent;
    const conditionComp = entity.getComponent(ComponentType.CONDITION) as ConditionComponent;

    if (!entityTypeComp || !conditionComp) {
      return false;
    }

    if (!ConditionHelper.isAlive(conditionComp)) {
      return false;
    }

    const entityType = entityTypeComp.entityType;
    const chachedInteraction = interactionCache.interactionCache.get(entityType);

    return chachedInteraction === InteractionType.ATTACK;
  }

  public activate() {
    LOG.debug('Attack pointer activated');
  }

  public deactivate() {
    LOG.debug('Attack pointer deactivated');
    if (this.activeSprite) {
      this.activeSprite.clearTint();
      this.activeSprite = null;
    }
  }

  public onClick(pointer: Px, entity?: Entity) {
    if (!entity) {
      return;
    }

    if (!this.isAttackable(entity)) {
      this.manager.dismissActive();
      return;
    }

    if (this.inRangeForBasicAttack(entity)) {
      this.performBasicAttack(entity);
    } else {
      this.ctx.helper.move.moveTo(pointer, () => this.performQueuedAttack(entity));
    }
  }

  private performBasicAttack(entity: Entity) {
    const attackerEntity = this.ctx.playerHolder.activeEntity;
    const attackerPos = (attackerEntity.getComponent(ComponentType.POSITION) as PositionComponent).position;
    const attackerPosComp = (entity.getComponent(ComponentType.POSITION) as PositionComponent);
    const defenderPos = attackerPosComp.position;

    const attackerVisualComp = (attackerEntity.getComponent(ComponentType.VISUAL) as VisualComponent);
    attackerVisualComp.sightDirection = getSightDirection(attackerPos, defenderPos);
    const atkMsg = new BasicAttackMessage(entity.id);
    PubSub.publish(Topics.IO_SEND_MSG, atkMsg);
  }

  private performQueuedAttack(entity: Entity) {
    // If the attack was queued the attackable state of the entity might have changed
    // in the meantime so we need to re-check.
    if (this.isAttackable(entity)) {
      return;
    }
    if (this.inRangeForBasicAttack(entity)) {
      this.performBasicAttack(entity);
    } else {
      const positionComp = entity.getComponent(ComponentType.POSITION) as PositionComponent;
      if (!positionComp) {
        return;
      }
      const px = MapHelper.pointToPixel(positionComp.position);
      this.ctx.helper.move.moveTo(px, () => this.performQueuedAttack(entity));
    }
  }

  private inRangeForBasicAttack(entity: Entity): boolean {
    const playerEntity = this.playerHolder.activeEntity;
    if (!playerEntity) {
      return false;
    }

    const playerPositionComp = playerEntity.getComponent(ComponentType.POSITION) as PositionComponent;
    const playerAttacksComp = playerEntity.getComponent(ComponentType.ATTACKS) as AttacksComponent;
    const entityPositionComp = entity.getComponent(ComponentType.POSITION) as PositionComponent;
    if (!playerPositionComp || !playerAttacksComp || !entityPositionComp) {
      return false;
    }

    const d = entityPositionComp.position.getDistance(playerPositionComp.position);
    const baseAtkRange = playerAttacksComp.basicAttackRange;
    return baseAtkRange >= d;
  }

  public updatePosition(pointer: Px, entity?: Entity) {
    if (entity) {
      const sprite = entity.data.visual && entity.data.visual.sprite;
      if (sprite) {
        sprite.setTint(0xFF0000);
        this.activeSprite = sprite;
      }
    }
  }
}
