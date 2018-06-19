import * as LOG from 'loglevel';

import { Pointer } from './Pointer';
import { PointerManager } from './PointerManager';
import { EngineContext } from '../EngineContext';
import { PointerPriority } from './PointerPriority';
import { Px } from 'model';
import { Entity } from 'entities';
import { ComponentType } from 'entities/components';

export class BasicAttackPointer extends Pointer {

  private activeSprite: Phaser.GameObjects.Sprite;

  constructor(
    manager: PointerManager,
    ctx: EngineContext
  ) {
    super(manager, ctx);
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

  public updatePosition(pointer: Px, entity?: Entity) {
    if (entity) {
      const sprite = entity.data.visual && entity.data.visual.sprite;
      if (sprite) {
        sprite.setTint(0xFF0000);
        this.activeSprite = sprite;
      }
    }
  }

  private isAttackable(entity: Entity) {
    return entity.hasComponent(ComponentType.CONDITION);
  }
}
