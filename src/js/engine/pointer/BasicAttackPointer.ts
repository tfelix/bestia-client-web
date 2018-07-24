import * as PubSub from 'pubsub-js';

import { Pointer } from './Pointer';
import { PointerManager } from './PointerManager';
import { EngineContext } from '../EngineContext';
import { PointerPriority } from './PointerPriority';
import { Px, Point } from 'model';
import { Entity, PlayerEntityHolder } from 'entities';
import { ComponentType, PositionComponent, VisualComponent, InteractionType } from 'entities/components';
import { EntityTypeComponent } from 'entities/components/EntityTypeComponent';
import { AttacksComponent } from 'entities/components/AttacksComponent';
import { BasicAttackMessage } from 'message/BasicAttackMessage';
import { Topics } from 'Topics';
import { ConditionComponent, ConditionHelper } from 'entities/components/ConditionComponent';
import { MapHelper } from 'map';
import { getSpriteDescriptionFromCache } from '../renderer';
import { SpriteCollision } from 'map/SpriteCollision';
import { CursorType } from './CursorManager';

function getSightDirection(source: Point, lookingTo: Point): Point {
  return lookingTo.minus(source).norm();
}

const SQRT_2 = 1.41421;

export class BasicAttackPointer extends Pointer {

  private activeSprite: Phaser.GameObjects.Sprite;
  private playerHolder: PlayerEntityHolder;
  private nextPossibleAttack = 0;

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

    const entityTypeComp = entity.getComponent(ComponentType.ENTITY_TYPE) as EntityTypeComponent;
    const conditionComp = entity.getComponent(ComponentType.CONDITION) as ConditionComponent;

    if (!entityTypeComp || !conditionComp) {
      return false;
    }

    if (!ConditionHelper.isAlive(conditionComp)) {
      return false;
    }

    const entityType = entityTypeComp.entityType;
    const chachedInteraction = this.ctx.interactionCache.get(entityType);

    return chachedInteraction === InteractionType.ATTACK;
  }

  public activate() {
    this.ctx.cursorManager.setCursorSprite(CursorType.ATTACK);
  }

  public deactivate() {
    if (this.activeSprite) {
      this.activeSprite.clearTint();
      this.activeSprite = null;
    }
    this.ctx.cursorManager.setCursorSprite(CursorType.DEFAULT);
  }

  public onClick(pointer: Px, entity?: Entity) {
    if (!entity) {
      return;
    }

    if (!this.isAttackable(entity)) {
      this.manager.dismissActive();
      return;
    }

    if (!this.isCooldownOver()) {
      return;
    }

    if (this.inRangeForBasicAttack(entity)) {
      this.performBasicAttack(entity);
    } else {
      // The entity is probably not walkable so we need the closes walkable tile coordinate.
      const point = MapHelper.pixelToPoint(pointer.x, pointer.y);
      const spriteDesc = getSpriteDescriptionFromCache(entity.data.visual.spriteName, this.ctx.game);
      const spriteCollision = new SpriteCollision(point, spriteDesc);
      const playerPos = (this.ctx.playerHolder.activeEntity.getComponent(ComponentType.POSITION) as PositionComponent).position;
      const walkTarget = spriteCollision.nextNonCollision(playerPos, point);
      this.ctx.helper.move.moveToPoint(walkTarget, () => this.performBasicAttack(entity));
    }
  }

  private performContinuingAttack(attackedEntity: Entity) {
    if (!this.isAttackable(attackedEntity)) {
      return;
    }

    if (!this.inRangeForBasicAttack(attackedEntity)) {
      return;
    }

    this.performBasicAttack(attackedEntity);
  }

  private performBasicAttack(attackedEntity: Entity) {
    const attackerEntity = this.ctx.playerHolder.activeEntity;
    const attackerPos = (attackerEntity.getComponent(ComponentType.POSITION) as PositionComponent).position;
    const defenderPos = (attackedEntity.getComponent(ComponentType.POSITION) as PositionComponent).position;

    const attackerVisualComp = (attackerEntity.getComponent(ComponentType.VISUAL) as VisualComponent);
    attackerVisualComp.sightDirection = getSightDirection(attackerPos, defenderPos);

    const atkMsg = new BasicAttackMessage(attackedEntity.id);
    PubSub.publish(Topics.IO_SEND_MSG, atkMsg);

    const attackerAtkComp = attackerEntity.getComponent(ComponentType.ATTACKS) as AttacksComponent;
    const aspd = attackerAtkComp && attackerAtkComp.basicAttacksPerSecond || 0;
    this.nextPossibleAttack = this.ctx.game.time.now + 1000 / aspd;

    this.setupContiniousAttack(attackedEntity);
  }

  private setupContiniousAttack(attackedEntity: Entity) {
    const playerEntity = this.ctx.playerHolder.activeEntity;
    const attackerAtkComp = playerEntity.getComponent(ComponentType.ATTACKS) as AttacksComponent;
    const atkDelay = 1000 / attackerAtkComp.basicAttacksPerSecond;
    this.ctx.game.time.addEvent({ delay: atkDelay, callback: () => this.performContinuingAttack(attackedEntity) });
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
      this.ctx.helper.move.moveToPixel(px, () => this.performQueuedAttack(entity));
    }
  }

  private isCooldownOver(): boolean {
    return this.nextPossibleAttack <= this.ctx.game.time.now;
  }

  private inRangeForBasicAttack(entity: Entity): boolean {
    const playerEntity = this.playerHolder.activeEntity;
    if (!playerEntity) {
      return false;
    }

    const playerAttacksComp = playerEntity.getComponent(ComponentType.ATTACKS) as AttacksComponent;
    if (!playerAttacksComp) {
      return false;
    }

    const d = PositionComponent.getDistance(playerEntity, entity);
    const baseAtkRange = playerAttacksComp.basicAttackRange * SQRT_2;
    return baseAtkRange >= d && d !== -1;
  }

  public updatePointerPosition(pointer: Px, entity?: Entity) {
    if (entity) {
      const sprite = entity.data.visual && entity.data.visual.sprite;
      if (sprite) {
        sprite.setTint(0xFF0000);
        this.activeSprite = sprite;
      }
    }
  }
}
