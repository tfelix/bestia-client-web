export class TextAnimator {

  private eventCounter = 0;
  private dialog: string[];
  private timedEvent: Phaser.Time.TimerEvent;
  public letterPerSecond = 6;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly text: Phaser.GameObjects.Text
  ) {

  }

  public animateText(text: string, animate = true) {
    this.eventCounter = 0;
    this.dialog = text.split('');
    if (this.timedEvent) {
      this.timedEvent.destroy();
    }

    const tempText = animate ? '' : text;

    if (animate) {

      this.timedEvent = this.scene.time.addEvent({
        delay: 1000 / this.letterPerSecond,
        callback: this.showNextLetter,
        callbackScope: this,
        loop: true
      });
    }
  }

  private showNextLetter() {
    this.eventCounter++;
    this.text.setText(this.text.text + this.dialog[this.eventCounter - 1]);
    if (this.eventCounter === this.dialog.length) {
      this.timedEvent.destroy();
    }
  }
}
