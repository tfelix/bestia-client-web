import * as LOG from 'loglevel';

import { Entity } from 'app/game/entities';
import { Px, Point } from 'app/game/model';
import { EngineEvents } from 'app/game/message';

import { MapHelper } from '../MapHelper';
import { EngineContext } from '../EngineContext';
import { MovePointer } from './MovePointer';
import { NullPointer } from './NullPointer';
import { Pointer } from './Pointer';
import { BasicAttackPointer } from './BasicAttackPointer';
import { ItemPickupPointer } from './ItemPickupPointer';
import { InteractionPointer } from './InteractionPointer';
import { FishingPointer } from './FishingPointer';

/**
 * The manager is responsible for switching the indicator depending on the needs
 * of the engine. It listens to various events (usage of an item for example)
 * and in case of this will switch the indicator. This indicator then gets the
 * control of the inputs and must react accordingly.
 * <p>
 * The manager does also listen to change requests from the outside. So it is
 * possible to react upon hover effects over sprites for example.
 * </p>
 */
export class PointerManager {

  private pointers: Pointer[] = [];
  // FIXME We probably dont need a stack here and can simple have the active pointer
  // with the prio system
  private pointerStack: Pointer[] = [];

  get activePointer(): Pointer {
    const pointer = this.pointerStack[this.pointerStack.length - 1];
    return (!pointer) ? this.nullIndicator : pointer;
  }

  private movePointer: Pointer;
  private nullIndicator: Pointer;

  private entityUnderPointer: Entity | null = null;

  constructor(
    private readonly engineContext: EngineContext
  ) {

    this.nullIndicator = new NullPointer(this, engineContext);
    this.movePointer = new MovePointer(this, engineContext);

    // Register the available indicators.
    this.pointers.push(this.movePointer);
    this.pointers.push(new BasicAttackPointer(this, engineContext));
    this.pointers.push(new ItemPickupPointer(this, engineContext));
    // this.pointers.push(new InteractionPointer(this, engineContext));
    this.pointers.push(new FishingPointer(this, engineContext));

    this.engineContext.game.input.on('pointerdown', this.onPointerClicked, this);
    this.engineContext.game.input.on('gameobjectover', this.onGameObjectOver, this);
    this.engineContext.game.input.on('gameobjectout', this.onGameObjectOut, this);

    PubSub.subscribe(EngineEvents.GAME_MOUSE_OUT, () => this.hide());
    PubSub.subscribe(EngineEvents.GAME_MOUSE_OVER, () => this.show());
  }

  private onGameObjectOut() {
    this.entityUnderPointer = null;
  }

  private onGameObjectOver(
    pointer: Phaser.Input.Pointer,
    gameObj: Phaser.GameObjects.Sprite
  ) {
    const entity = this.getEntityFromGameObj(gameObj);
    this.entityUnderPointer = entity;
  }

  // This method is here because it uses the phaser pointer to avoid object creation
  private pointerToPx(pointer: Phaser.Input.Pointer): Px {
    const worldX = this.engineContext.game.cameras.main.scrollX + pointer.x;
    const worldY = this.engineContext.game.cameras.main.scrollY + pointer.y;
    return new Px(worldX, worldY);
  }

  private getEntityFromGameObj(gameObj?: Phaser.GameObjects.GameObject): Entity | null {
    const checkedGameObj = (gameObj instanceof Phaser.GameObjects.GameObject) ? gameObj : null;
    const entityId = checkedGameObj && checkedGameObj.getData('entity_id') || undefined;
    if (!entityId) {
      return null;
    }
    return this.engineContext.entityStore.getEntity(entityId);
  }

  private onPointerClicked(pointer: Phaser.Input.Pointer, gameObj?: Phaser.GameObjects.GameObject[]) {
    const gameObjSingle = gameObj && (gameObj.length > 0) ? gameObj[0] : null;
    const entity = this.getEntityFromGameObj(gameObjSingle);
    const px = this.pointerToPx(pointer);
    const pos = MapHelper.pixelToPoint(px.x, px.y);

    this.activePointer.onClick(px, pos, entity);
  }

  public hide() {
    // this.setActive(this.nullIndicator, true);
  }

  public show() {
    if (this.activePointer !== this.nullIndicator) {
      return;
    }
    this.dismissActive();
  }

  public load() {
    this.pointers.forEach(x => x.load());
  }

  public create() {
    this.pointers.forEach(x => x.create());
    this.setActive(this.movePointer);
  }

  public update() {
    const activePointer = this.engineContext.game.input.activePointer;
    const worldX = this.engineContext.game.cameras.main.scrollX + activePointer.x;
    const worldY = this.engineContext.game.cameras.main.scrollY + activePointer.y;
    const pxClamped = MapHelper.getClampedTilePixelXY(worldX, worldY);
    const pos = MapHelper.pixelToPoint(worldX, worldY);

    this.checkPointerPriority(pxClamped, pos);

    this.activePointer.updatePointerPosition(pxClamped, pos, this.entityUnderPointer);
  }

  private checkPointerPriority(px: Px, pos: Point) {
    let maxPrio = -1;
    let maxPrioPointer: Pointer = null;

    this.pointers.forEach(p => {
      const pointerPrio = p.reportPriority(px, pos, this.entityUnderPointer);
      if (pointerPrio > maxPrio) {
        maxPrio = pointerPrio;
        maxPrioPointer = p;
      }
    });

    if (maxPrioPointer !== this.activePointer) {
      this.setActive(maxPrioPointer);
    }
  }

  public setActive(pointer: Pointer) {
    this.activePointer.deactivate();
    this.pointerStack.push(pointer);
    this.activePointer.activate();
  }

  public dismissActive() {
    this.activePointer.deactivate();
    if (this.pointerStack.length === 0) {
      this.pointerStack.push(this.movePointer);
    } else {
      this.pointerStack.pop();
    }

    this.activePointer.activate();
  }
}
