import { Entity, InventoryComponent, ComponentType } from 'app/game/entities';
import { UIConstants, AtlasUIBase } from 'app/game/ui';

import { ComponentRenderer } from './ComponentRenderer';
import { EngineContext } from '../../EngineContext';
import { TextStyles } from '../../TextStyles';
import { SceneNames } from '../../scenes/SceneNames';

class ItemViewModel {
  constructor(
    public readonly name: string,
    public readonly amount: number,
    public readonly spriteName: string
  ) {
  }
}

interface StoredItem {
  itemId: number;
  amount: number;
}

export class InventoryComponentRenderer extends ComponentRenderer<InventoryComponent> {

  private lastSeenItems: StoredItem[] = [];
  private lastItemCount = 0;
  private itemPickupQueue: ItemViewModel[] = [];

  private ui: Phaser.Scene;
  private obtainedBg: Phaser.GameObjects.Image;
  private obtainedContainer: Phaser.GameObjects.Container;

  constructor(
    private readonly ctx: EngineContext
  ) {
    super(ctx.gameScene);

    this.ui = ctx.gameScene.scene.get(SceneNames.UI_DIALOG);
  }

  get supportedComponent(): ComponentType {
    return ComponentType.INVENTORY;
  }

  protected hasNotSetup(entity: Entity, component: InventoryComponent): boolean {
    // We simply dont need to tick and check for each entity.
    if (!this.ctx.playerHolder.isActivePlayerEntity(entity)) {
      return false;
    }

    if (this.lastItemCount < component.totalItemCount) {
      this.queueNewItems(entity, component);
    }

    return this.itemPickupQueue.length > 0;
  }

  protected createGameData(entity: Entity, component: InventoryComponent) {
    // Maybe fetch translation of item first here. I dont know.
    this.showItemObtained();
  }

  private queueNewItems(entity: Entity, component: InventoryComponent) {
    component.items.forEach(invItem => {
      const presentItem = this.lastSeenItems.find(x => x.itemId === invItem.itemId);

      if (presentItem) {
        // Item already there, if the amount is bigger, queue difference.
        const d = invItem.amount - presentItem.amount;
        if (d <= 0) {
          return;
        }
        this.itemPickupQueue.push(new ItemViewModel(invItem.dbName, d, invItem.image));
      } else {
        // Item not yet in inventory. Add total to queue.
        this.itemPickupQueue.push(new ItemViewModel(invItem.dbName, invItem.amount, invItem.image));
      }
    });

    this.lastSeenItems = component.items.map(x => {
      return { itemId: x.itemId, amount: x.amount };
    });
    this.lastItemCount = component.totalItemCount;
  }

  protected updateGameData(entity: Entity, component: InventoryComponent) { }

  public create() {
    this.obtainedBg = this.ui.add.image(0, 0, AtlasUIBase, UIConstants.UI_ITEM_OBTAINED_BG);
    this.obtainedBg.setOrigin(0, 0);

    const xOffset = (this.ctx.helper.display.sceneWidth - this.obtainedBg.width) / 2;
    this.obtainedContainer = this.ui.add.container(xOffset, 10, [this.obtainedBg]);
    this.obtainedContainer.alpha = 0;
  }

  private showItemObtained() {
    if (this.itemPickupQueue.length === 0) {
      return;
    }
    const viewItem = this.itemPickupQueue.shift();

    const itemImg = this.ui.add.image(12, 12, viewItem.name);
    itemImg.setOrigin(0, 0);
    const obtainedText = this.ui.add.text(50, 16, `${viewItem.name} x${viewItem.amount}`, TextStyles.UI);

    this.obtainedContainer.add([itemImg, obtainedText]);

    const timeline = this.ui.tweens.timeline({
      tweens: [
        {
          targets: this.obtainedContainer,
          alpha: 1,
          y: 30,
          duration: 500
        },
        {
          targets: this.obtainedContainer,
          alpha: 0,
          y: 20,
          duration: 500,
          delay: 2000,
          onComplete: () => {
            itemImg.destroy();
            obtainedText.destroy();
            timeline.destroy();
            this.showItemObtained();
          }
        }
      ]
    });
  }
}
