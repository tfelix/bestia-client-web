import * as LOG from 'loglevel';
import * as PubSub from 'pubsub-js';

import { Pointer } from './Pointer';
import { PointerManager } from './PointerManager';
import { EngineContext } from '../EngineContext';
import { PointerPriority } from './PointerPriority';
import { Px } from 'model';
import { Entity, PlayerEntityHolder } from 'entities';

export class ItemPickupPointer extends Pointer {

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

  public activate() {
    LOG.debug('Item pick pointer activated');
  }

  public deactivate() {
    LOG.debug('Item pick pointer deactivated');
    if (this.activeSprite) {
      this.activeSprite.clearTint();
      this.activeSprite = null;
    }
  }

  public onClick(pointer: Px, entity?: Entity) {

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
