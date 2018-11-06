export class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'BootScene'
    });
  }

  public preload(): void {
    this.load.image('cloud', '../assets/img/cloud.png');
    this.load.image('logo', '../assets/img/logo.png');
    this.load.image('splash-bg', '../assets/img/splash-bg.jpg');
  }

  public create() {
    this.game.input.mouse.disableContextMenu();

    this.events.on('resize', this.resize, this);
  }

  private resize(width, height) {
    if (width === undefined) { width = this.sys.game.config.width; }
    if (height === undefined) { height = this.sys.game.config.height; }
    this.cameras.resize(width, height);
  }

  public update(): void {
    this.scene.start('LoadScene');
  }
}
