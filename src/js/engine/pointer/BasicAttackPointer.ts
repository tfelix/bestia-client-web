import * as LOG from 'loglevel';

import { Pointer } from './Pointer';
import { PointerManager } from './PointerManager';
import { EngineContext } from '../EngineContext';
import { PointerPriority } from './PointerPriority';
import { Px, Point } from 'model';
import { Entity, PlayerEntityHolder } from 'entities';
import { ComponentType, PositionComponent, MoveComponent } from 'entities/components';
import { DamageAction } from 'entities/actions';
import { EntityTypeComponent, EntityType } from 'entities/components/EntityTypeComponent';
import { InteractionCacheLocalComponent, InteractionType } from 'entities/components/local/InteractionCacheLocalComponent';
import { AttacksComponent } from 'entities/components/AttacksComponent';
import { MapHelper } from 'map';
import { DisplayHelper } from '../DisplayHelper';

export class BasicAttackPointer extends Pointer {

  private activeSprite: Phaser.GameObjects.Sprite;
  private playerHolder: PlayerEntityHolder;
  private displayHelper: DisplayHelper;

  constructor(
    manager: PointerManager,
    ctx: EngineContext
  ) {
    super(manager, ctx);

    this.playerHolder = ctx.playerHolder;

    // TODO Consider putting this into the ctx
    this.displayHelper = new DisplayHelper(ctx.game);
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

    if (!entityTypeComp) {
      return false;
    }

    // TODO Dieses Monster if refactorn.
    if (entityTypeComp.entityType === EntityType.BESTIA) {
      if (interactionCache) {
        if (interactionCache.interactionCache.get(EntityType.BESTIA) === InteractionType.ATTACK) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
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

    if (this.inRangeForBasicAttack(entity)) {
      // Do attack.
      const dmg = Math.floor(Math.random() * 15 + 4);
      const dmgAction = new DamageAction(dmg);
      entity.actions.push(dmgAction);
    } else {
      // Walk to it
      this.onClickMove(pointer);
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

  // ================================
  // TODO Refactor into shared code with move pointer
  private onPathFound(usedShiftOffset: Point, path: Array<{ x: number; y: number }>) {
    if (path === null) {
      return;
    }
    // We must shift the path into the collision map first. Now we must undo this again to
    // world space.
    const shiftedPath = path.map(pos => new Point(pos.x + usedShiftOffset.x, pos.y + usedShiftOffset.y));

    LOG.debug(`Path found: ${JSON.stringify(shiftedPath)}`);
    if (shiftedPath.length === 0) {
      return;
    }

    const componentId = Math.floor(Math.random() * -10000);

    const playerEntityId = this.ctx.playerHolder.activeEntity.id;
    const move = new MoveComponent(
      componentId,
      playerEntityId
    );
    move.walkspeed = 1;
    move.path = shiftedPath;
    this.ctx.entityStore.addComponent(move);
  }

  private onClickMove(pointer: Px) {
    const activePlayerEntity = this.ctx.playerHolder.activeEntity;
    if (!activePlayerEntity) {
      return;
    }
    const playerPositionComponent = activePlayerEntity.getComponent(ComponentType.POSITION) as PositionComponent;
    if (!playerPositionComponent) {
      return;
    }
    const start = playerPositionComponent.position;
    const goal = MapHelper.pixelToPoint(pointer.x, pointer.y);

    const scrollOffset = this.displayHelper.getScrollOffset();
    const shiftedStart = start.minus(scrollOffset);
    const shiftedGoal = goal.minus(scrollOffset).minus(new Point(0, 1));

    LOG.debug(`Find path from: ${JSON.stringify(shiftedStart)} to ${JSON.stringify(shiftedGoal)}`);
    this.ctx.pathfinder.findPath(shiftedStart.x, shiftedStart.y, shiftedGoal.x, shiftedGoal.y, this.onPathFound.bind(this, scrollOffset));
  }
}
