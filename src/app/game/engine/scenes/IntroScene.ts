import { SceneNames } from './SceneNames';
import { Loadbar } from './Loadbar';
import { TextStyles } from '../TextStyles';

export class IntroScene extends Phaser.Scene {

  private readonly loadbar: Loadbar;

  constructor() {
    super({
      key: SceneNames.INTRO
    });

    this.loadbar = new Loadbar(this);
  }

  public preload() {
    this.loadbar.setup();

    this.load.atlas(
      'base',
      '../assets/base-new.png',
      '../assets/base-new.json'
    );
  }

  public create() {
    this.loadbar.destroy();

    const introText = [
      'In an everchanging world the secrets lurk inside the shadows.'
    ];

    const texts = introText.map(txt => this.add.text(100, 200, txt, TextStyles.INTRO));

    // const skipButton = this.add.image(height - 100, width - 100, UIAtlas, UIConstants.PLACEHOLDER);
    // TODO Add Intro Skip code to button
  }
}
