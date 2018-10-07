import { VisualDepth } from 'app/game/engine/renderer/VisualDepths';
import { UIAtlas, UIConstants } from './UiConstants';

export class DialogModalPlugin extends Phaser.Plugins.ScenePlugin {

  private closeBtn: Phaser.GameObjects.Image;
  private graphics: Phaser.GameObjects.Graphics;
  private text: Phaser.GameObjects.Text;
  private timedEvent?: Phaser.Time.TimerEvent;

  private borderThickness = 3;
  private borderColor = 0x907748;
  private borderAlpha = 1;
  private windowAlpha = 0.8;
  private windowColor = 0x303030;
  private windowHeight = 150;
  private padding = 32;
  private dialogSpeed = 3;

  private eventCounter = 0;
  private visible = true;
  private dialog?: string[];

  constructor(scene, pluginManager) {
    super(scene, pluginManager);
  }

  public boot() {
    const eventEmitter = this.systems.events;
    eventEmitter.on('shutdown', this.shutdown, this);
    eventEmitter.on('destroy', this.destroy, this);
  }

  //  Called when a Scene shuts down, it may then come back again later
  // (which will invoke the 'start' event) but should be considered dormant.
  public shutdown() {

  }

  // called when a Scene is destroyed by the Scene Manager
  public destroy() {
    this.shutdown();
    this.scene = undefined;
  }

  public setup(opts?: any) {
    opts = opts || {};
    // set properties from opts object or use defaults
    this.borderThickness = opts.borderThickness || 3;
    this.borderColor = opts.borderColor || 0x907748;
    this.borderAlpha = opts.borderAlpha || 1;
    this.windowAlpha = opts.windowAlpha || 0.9;
    this.windowColor = opts.windowColor || 0x303030;
    this.windowHeight = opts.windowHeight || 150;
    this.padding = opts.padding || 32;
    this.dialogSpeed = opts.dialogSpeed || 3;

    this.createWindow();
    this.toggleWindow();
  }

  public setText(text: string, animate = true) {
    this.eventCounter = 0;
    this.dialog = text.split('');
    if (this.timedEvent) {
      this.timedEvent.destroy();
    }

    const tempText = animate ? '' : text;
    this.displayText(tempText);

    if (animate) {
      this.timedEvent = this.scene.time.addEvent({
        delay: 150 - (this.dialogSpeed * 30),
        callback: this.animateText,
        callbackScope: this,
        loop: true
      });
    }

    if (!this.visible) {
      this.toggleWindow();
    }
  }

  private animateText() {
    this.eventCounter++;
    this.text.setText(this.text.text + this.dialog[this.eventCounter - 1]);
    if (this.eventCounter === this.dialog.length) {
      this.timedEvent.destroy();
    }
  }

  private displayText(text: string) {
    if (this.text) {
      this.text.destroy();
    }

    const x = this.padding + 10;
    const y = this.getGameHeight() - this.windowHeight - this.padding + 10;

    this.text = this.scene.make.text({
      x,
      y,
      text,
      style: {
        wordWrap: { width: this.getGameWidth() - (this.padding * 2) - 25 }
      }
    });
    this.text.depth = VisualDepth.UI;
  }

  private getGameWidth(): number {
    return this.scene.sys.game.config.width as number;
  }

  // Gets the height of the game (based on the scene)
  private getGameHeight(): number {
    return this.scene.sys.game.config.height as number;
  }

  // Calculates where to place the dialog window based on the game size
  private calculateWindowDimensions(width, height) {
    const x = this.padding;
    const y = height - this.windowHeight - this.padding;
    const rectWidth = width - (this.padding * 2);
    const rectHeight = this.windowHeight;
    return {
      x,
      y,
      rectWidth,
      rectHeight
    };
  }

  // Creates the inner dialog window (where the text is displayed)
  private createInnerWindow(x, y, rectWidth, rectHeight) {
    this.graphics.fillStyle(this.windowColor, this.windowAlpha);
    this.graphics.fillRect(x + 2, y + 3, rectWidth - 5, rectHeight - 5);
  }

  // Creates the border rectangle of the dialog window
  private createOuterWindow(x, y, rectWidth, rectHeight) {
    this.graphics.lineStyle(this.borderThickness, this.borderColor, this.borderAlpha);
    this.graphics.strokeRect(x, y, rectWidth, rectHeight);
    this.graphics.lineStyle(1, 0x62615F, this.borderAlpha);
    this.graphics.strokeRect(
      x + this.borderThickness - 1,
      y + this.borderThickness - 1,
      rectWidth - (this.borderThickness - 1) * 2,
      rectHeight - (this.borderThickness - 1) * 2
    );
  }

  private createCloseModalButton() {
    this.closeBtn = this.scene.add.image(
      this.getGameWidth() - this.padding - 5,
      this.getGameHeight() - this.windowHeight - this.padding - 5,
      UIAtlas,
      UIConstants.CANCEL
    );
    this.closeBtn.setScale(0.7);
    this.closeBtn.setScaleMode(Phaser.ScaleModes.NEAREST);
    this.closeBtn.depth = VisualDepth.UI;
    this.closeBtn.setInteractive();

    this.closeBtn.on('pointerover', () => {
      this.closeBtn.setScale(0.8);
      this.closeBtn.setTint(0xFFFFFF);
    });
    this.closeBtn.on('pointerout', () => {
      this.closeBtn.setScale(0.7);
      this.closeBtn.clearTint();
    });
    this.closeBtn.on('pointerdown', () => {
      this.toggleWindow();
    });
  }

  private toggleWindow() {
    this.visible = !this.visible;
    if (this.text) {
      this.text.visible = this.visible;
    }
    if (this.graphics) {
      this.graphics.visible = this.visible;
    }
    if (this.closeBtn) {
      this.closeBtn.visible = this.visible;
    }
  }

  private createWindow() {
    const gameHeight = this.getGameHeight();
    const gameWidth = this.getGameWidth();
    const dimensions = this.calculateWindowDimensions(gameWidth, gameHeight);
    this.graphics = this.scene.add.graphics();
    this.graphics.depth = VisualDepth.UI;

    this.createOuterWindow(dimensions.x, dimensions.y, dimensions.rectWidth, dimensions.rectHeight);
    this.createInnerWindow(dimensions.x, dimensions.y, dimensions.rectWidth, dimensions.rectHeight);
    this.createCloseModalButton();
  }
}
