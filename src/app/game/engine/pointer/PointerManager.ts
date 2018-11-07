import * as LOG from 'loglevel';

import { Entity } from 'app/game/entities';
import { Px } from 'app/game/model';
import { EngineEvents } from 'app/game/message';

import { MapHelper } from '../MapHelper';
import { EngineContext } from '../EngineContext';
import { MovePointer } from './MovePointer';
import { NullPointer } from './NullPointer';
import { Pointer } from './Pointer';
import { BasicAttackPointer } from './BasicAttackPointer';
import { ItemPickupPointer } from './ItemPickupPointer';
import { InteractionPointer } from './InteractionPointer';

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
  private pointerStack: Pointer[] = [];

  private activePointer: Pointer;
  private movePointer: Pointer;
  private nullIndicator: Pointer;

  private entityUnderPointer: Entity | null = null;

  constructor(
    private readonly engineContext: EngineContext
  ) {

    this.nullIndicator = new NullPointer(this, engineContext);
    this.activePointer = this.nullIndicator;
    this.movePointer = new MovePointer(this, engineContext);

    // Register the available indicators.
    this.pointers.push(this.movePointer);
    this.pointers.push(new BasicAttackPointer(this, engineContext));
    this.pointers.push(new ItemPickupPointer(this, engineContext));
    this.pointers.push(new InteractionPointer(this, engineContext));

    // this.engineContext.game.input.on('pointermove', this.updateActivePointerPosition, this);
    this.engineContext.game.input.on('pointerdown', this.onPointerClicked, this);
    this.engineContext.game.input.on('gameobjectover', this.activateActivePointer, this);
    this.engineContext.game.input.on('gameobjectout', this.onPointerOut, this);

    PubSub.subscribe(EngineEvents.GAME_MOUSE_OUT, () => this.hide());
    PubSub.subscribe(EngineEvents.GAME_MOUSE_OVER, () => this.show());
  }

  private onPointerOut() {
    this.entityUnderPointer = null;
    this.showDefault();
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

  private activateActivePointer(
    pointer: Phaser.Input.Pointer,
    gameObj: Phaser.GameObjects.Sprite
  ) {
    const entity = this.getEntityFromGameObj(gameObj);
    this.entityUnderPointer = entity;

    const px = this.pointerToPx(pointer);
    let highestPriority = 0;
    let highestPriorityPointer: Pointer = null;
    this.pointers.forEach(x => {
      const pointerPrio = x.checkActive(pointer, entity);
      if (pointerPrio > highestPriority && highestPriority > -1) {
        highestPriority = pointerPrio;
        highestPriorityPointer = x;
      }
    });
    if (highestPriorityPointer !== null) {
      this.setActive(highestPriorityPointer);
      this.activePointer.updatePointerPosition(px, entity);
    }
  }

  private onPointerClicked(pointer: Phaser.Input.Pointer, gameObj?: Phaser.GameObjects.GameObject[]) {
    const gameObjSingle = gameObj && (gameObj.length > 0) ? gameObj[0] : null;
    const entity = this.getEntityFromGameObj(gameObjSingle);
    const px = this.pointerToPx(pointer);
    this.activePointer.onClick(px, entity);
  }

  private updateActivePointerPosition(pointer: Phaser.Input.Pointer) {
    const worldX = this.engineContext.game.cameras.main.scrollX + pointer.x;
    const worldY = this.engineContext.game.cameras.main.scrollY + pointer.y;
    const cords = MapHelper.getClampedTilePixelXY(worldX, worldY);
    this.activePointer.updatePointerPosition(cords);
  }

  public hide() {
    this.requestActive(this.nullIndicator, true);
  }

  public show() {
    // We can only show when previously hidden.
    if (this.activePointer !== this.nullIndicator) {
      return;
    }
    this.dismissActive();
  }

  public showDefault() {
    this.requestActive(this.movePointer);
    this.pointerStack = [];
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
    this.updateActivePointerPosition(activePointer);
    this.activePointer.update(this.entityUnderPointer);
  }

  public requestActive(indicator, force = false) {
    // Ask the active pointer if he allows to be overwritten by the new
    // indicator.
    if (!force && !this.activePointer.allowOverwrite(indicator)) {
      return;
    }

    this.pointerStack.push(this.activePointer);
    this.activePointer.deactivate();
    this.activePointer = indicator;
    this.activePointer.activate();
  }

  private setActive(indicator) {
    // Ask the active pointer if he allows to be overwritten by the new
    // indicator.
    if (!this.activePointer.allowOverwrite(indicator)) {
      return;
    }
    this.activePointer.deactivate();
    this.activePointer = indicator;
    this.activePointer.activate();
  }

  public dismissActive() {
    this.activePointer.deactivate();
    if (this.pointerStack.length === 0) {
      this.activePointer = this.movePointer;
    } else {
      this.setActive(this.pointerStack.pop());
    }
    this.updateActivePointerPosition(this.engineContext.game.input.activePointer);
  }
}
