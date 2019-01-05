import { UIConstants, UIAtlasBase } from 'app/game/ui';
import { SceneNames } from './SceneNames';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({
      key: SceneNames.INTRO
    });
  }

  private introTextStyle = { fontFamily: 'Verdana', fontSize: 12, color: '#ffffff' };

  public preload() {
    this.load.atlas(
      'base',
      '../assets/base-new.png',
      '../assets/base-new.json'
    );
  }

  public create() {
    const introText = [
      'In an everchanging world the secrets lurk inside the shadows.'
    ];

    const texts = introText.map(txt => this.add.text(100, 200, txt, this.introTextStyle));

    // const skipButton = this.add.image(height - 100, width - 100, UIAtlas, UIConstants.PLACEHOLDER);
    // TODO Add Intro Skip code to button
  }
}
