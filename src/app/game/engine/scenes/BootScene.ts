import { SceneNames } from './SceneNames';

/**
 * The BootScene loads the really important stuff so the loading screen can
 * be displayed.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: SceneNames.BOOT
    });
  }

  public preload(): void {
    const widthHalf = (this.game.config.width as any) / 2;
    const heightHalf = (this.game.config.height as any) / 2;

    const circles = [
      new Phaser.Geom.Circle(widthHalf - 20, heightHalf, 5),
      new Phaser.Geom.Circle(widthHalf, heightHalf, 5),
      new Phaser.Geom.Circle(widthHalf + 20, heightHalf, 5)
    ];

    const graphics = this.add.graphics({ fillStyle: { color: 0xFFFFFF } });

    circles.forEach(c => graphics.fillCircleShape(c));
    graphics.alpha = 0;

    this.load.on('progress', value => {
      graphics.alpha = value;
    });
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
    this.scene.start(SceneNames.INTRO);
  }
}
