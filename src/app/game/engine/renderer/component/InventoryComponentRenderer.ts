import { Entity, InventoryComponent, ComponentType } from 'app/game/entities';
import { UIConstants, UIAtlas } from 'app/game/ui';

import { ComponentRenderer } from '.';
import { EngineContext } from '../../EngineContext';

// TODO Replace this with bitmap text
const uiTextStyle = { fontFamily: 'Arial', fontSize: 12, color: '#000000' };

let lastItemCount: number | undefined;
const itemPickupQueue: ItemViewModel[] = [];

class ItemViewModel {
  constructor(
    public readonly name: string,
    public readonly amount: number,
    public readonly spriteName: string
  ) {
  }
}

export class InventoryComponentRenderer extends ComponentRenderer<InventoryComponent> {

  private ui: Phaser.Scene;
  private obtainedBg: Phaser.GameObjects.Image;
  private obtainedContainer: Phaser.GameObjects.Container;

  constructor(
    private readonly ctx: EngineContext
  ) {
    super(ctx.game);

    this.ui = ctx.game.scene.get('UiScene');
  }

  get supportedComponent(): ComponentType {
    return ComponentType.INVENTORY;
  }

  protected hasNotSetup(entity: Entity, component: InventoryComponent): boolean {

    if (!this.ctx.playerHolder.isActivePlayerEntity(entity)) {
      return false;
    }

    if (lastItemCount === undefined) {
      lastItemCount = component.items.length;
    }
    // TODO what if only the amount has changed? Better calculate owned item number.
    return lastItemCount < component.items.length;
  }

  protected createGameData(entity: Entity, component: InventoryComponent) {
    lastItemCount = component.items.length;
    // TODO The way how we determine the last picked up item is totally buggy. We need
    // to consider if only the amount of a certain item went up. Must calculate delta between now and last check.
    const lastItem = component.items[component.items.length - 1];

    // TODO generalize the item key translation creation in a dedicated component
    const keyItemTranslation = `item.${lastItem.name}`;
    const translateRequest = [`item.${lastItem.name}`];
    this.ctx.i18n.translate(translateRequest, (t) => {
      const itemViewModel = new ItemViewModel(
        t[keyItemTranslation],
        lastItem.amount,
        lastItem.name
      );
      itemPickupQueue.push(itemViewModel);
      this.showItemObtained();
    });
  }

  protected updateGameData(entity: Entity, component: InventoryComponent) { }

  public create() {
    this.obtainedBg = this.ui.add.image(0, 0, UIAtlas, UIConstants.UI_ITEM_OBTAINED_BG);
    this.obtainedBg.setOrigin(0, 0);

    const xOffset = (this.ctx.helper.display.sceneWidth - this.obtainedBg.width) / 2;
    this.obtainedContainer = this.ui.add.container(xOffset, 10, [this.obtainedBg]);
    this.obtainedContainer.alpha = 0;
  }

  private showItemObtained() {
    if (itemPickupQueue.length === 0) {
      return;
    }
    const viewItem = itemPickupQueue.shift();

    const itemImg = this.ui.add.image(12, 12, viewItem.spriteName);
    itemImg.setOrigin(0, 0);
    const obtainedText = this.ui.add.text(50, 16, `${viewItem.name} x${viewItem.amount}`, uiTextStyle);

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
