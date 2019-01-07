import { TextStyles } from '../TextStyles';

export class Loadbar {

  private halfWidth: number;
  private halfHeight: number;
  private loadBar: Phaser.GameObjects.Graphics;
  private loaderText: Phaser.GameObjects.Text;

  constructor(
    private readonly scene: Phaser.Scene
  ) {
  }

  public setup() {
    this.halfWidth = this.scene.game.config.width as number / 2;
    this.halfHeight = this.scene.game.config.height as number / 2;

    this.loaderText = this.scene.add.text(this.halfWidth, this.halfHeight, '0 %', TextStyles.LOADER);
    this.loaderText.setOrigin(0.5);

    this.loadBar = this.scene.add.graphics();
    this.loadBar.x = this.halfWidth;
    this.loadBar.y = this.halfHeight;

    this.loadBar.lineStyle(20, 0xf2f2f2, 1);
    this.loadBar.beginPath();
    this.loadBar.arc(0, 0, 130, 0, Phaser.Math.DegToRad(370), false, 0.03);
    this.loadBar.strokePath();
    this.loadBar.closePath();

    this.scene.load.on('progress', progressValue => {
      this.loadBar.clear();
      this.loaderText.text = `${Math.round(progressValue * 100)} %`;
      this.loadBar.beginPath();
      this.loadBar.lineStyle(20, 0xf2f2f2, 1);
      this.loadBar.arc(0, 0, 130, 0, Phaser.Math.DegToRad(370 * progressValue), false, 0.03);
      this.loadBar.strokePath();
      this.loadBar.closePath();
    });
  }

  public destroy() {
    this.loadBar.destroy();
    this.loadBar = null;
    this.loaderText.destroy();
    this.loaderText = null;
  }
}
