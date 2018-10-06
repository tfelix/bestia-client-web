import { DialogModalPlugin } from 'app/game/ui';
import { SceneNames } from './SceneNames';

export class UiScene extends Phaser.Scene {

  public dialogModal: DialogModalPlugin;

  constructor() {
    super({
      key: SceneNames.UI
    });
  }

  public create() {
    this.dialogModal.setup();
  }
}
