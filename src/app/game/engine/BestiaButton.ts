
const buttonBackgroundColor = 0x1E2328;
const buttonBorderGradientTop = 0xc8aa6c;
const buttonBorderGradientBottom = 0x7b5d28;
const innerBorderColor = 0x070f17;
const borderWidth = 2;
const padding = 20;

export class BestiaButton extends Phaser.GameObjects.Text {

  private gfx: Phaser.GameObjects.Graphics;
  private wasFirstDrawn = false;

  constructor(scene, x, y, text, style, callback) {
    super(scene, x, y, text, style);

    this.setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.enterButtonHoverState())
      .on('pointerout', () => this.enterButtonRestState())
      .on('pointerdown', () => this.enterButtonActiveState())
      .on('pointerup', () => {
        this.enterButtonHoverState();
        callback();
      });

    this.gfx = this.scene.add.graphics();
  }

  private drawButton() {
    this.gfx.clear();

    this.gfx.depth = this.depth - 1;
    this.alpha = this.alpha;

    const x = this.x - this.displayOriginX;
    const y = this.y - this.displayOriginY;

    this.gfx.fillGradientStyle(buttonBorderGradientTop, buttonBorderGradientTop, buttonBorderGradientBottom, buttonBorderGradientBottom);
    this.gfx.fillRect(x - padding, y - padding, this.width + 2 * padding, this.height + 2 * padding);

    this.gfx.fillStyle(buttonBackgroundColor);
    this.gfx.fillRect(
      x - padding + borderWidth * 2,
      y - padding + borderWidth * 2,
      this.width + padding * 2 - borderWidth * 4,
      this.height + padding * 2 - borderWidth * 4
    );

    this.gfx.lineStyle(borderWidth, innerBorderColor);
    this.gfx.strokeRect(
      x - padding + borderWidth * 2 + 1,
      y - padding + borderWidth * 2 + 1,
      this.width + padding * 2 - (borderWidth * 4 + 2),
      this.height + padding * 2 - (borderWidth * 4 + 2)
    );

    this.gfx.lineStyle(borderWidth / 2, innerBorderColor, 0.5);
    this.gfx.strokeRect(
      x - padding + borderWidth * 2 + 3,
      y - padding + borderWidth * 2 + 3,
      this.width + padding * 2 - (borderWidth * 4 + 5),
      this.height + padding * 2 - (borderWidth * 4 + 5)
    );
  }

  public preUpdate() {
    this.gfx.alpha = this.alpha;

    if (this.dirty || !this.wasFirstDrawn) {
      this.wasFirstDrawn = true;
      this.drawButton();
    }
  }

  public enterButtonHoverState() {
    this.setStyle({ fill: '#ff0' });
  }

  public enterButtonRestState() {
    this.setStyle({ fill: '#0f0' });
  }

  public enterButtonActiveState() {
    this.setStyle({ fill: '#0ff' });
  }

  public destroy() {
    this.gfx.destroy();
    super.destroy();
  }
}
