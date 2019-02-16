import { SceneNames } from './SceneNames';

/**
 * Scene to display damage, chats e.g. everything which should not be affected
 * by the day and nights effects.
 */
export class UiScene extends Phaser.Scene {

  constructor() {
    super({
      key: SceneNames.UI
    });
  }
}
