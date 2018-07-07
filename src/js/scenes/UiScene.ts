import { DialogModalPlugin } from 'ui/DialogModalPlugin';

export class UiScene extends Phaser.Scene {

  public dialogModal: DialogModalPlugin;

  constructor() {
    super({
      key: 'UiScene'
    });
  }

  public create() {
    this.dialogModal.setup();

    /*
    TODO Implement the inventory
    const iconInventory = this.add.image(10, 10, UIAtlas, UIConstants.ICON_UI_INVENTORY);
    iconInventory.setScale(0.8);
    iconInventory.setOrigin(0, 0);
    */
  }
}
