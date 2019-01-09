import { DialogModalPlugin } from 'app/game/ui';
import { SceneNames } from './SceneNames';

export class UiDialogScene extends Phaser.Scene {

  public dialogModal: DialogModalPlugin;

  constructor() {
    super({
      key: SceneNames.UI_DIALOG
    });
  }

  public create() {
    this.dialogModal.setup();
    this.scene.bringToTop(SceneNames.UI_DIALOG);
  }
}
