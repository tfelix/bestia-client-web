export class UiSounds {

  public buttonClick: Phaser.Sound.BaseSound;
  public rollover: Phaser.Sound.BaseSound;

  constructor(scene: Phaser.Scene) {
    this.buttonClick = scene.sound.add('click', { loop: false });
    this.rollover = scene.sound.add('rollover', { loop: false });
  }
}
