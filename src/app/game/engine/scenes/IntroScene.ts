import * as LOG from 'loglevel';
import { SceneNames } from './SceneNames';
import { Loadbar } from './Loadbar';
import { TextStyles } from '../TextStyles';

// Checkout this artwork for possible intro:
// https://www.deviantart.com/joakimolofsson/art/Pointy-Rocks-439876005
// https://www.deviantart.com/joakimolofsson/art/Summoning-272650589
// https://www.deviantart.com/joakimolofsson/art/Sand-And-Rock-164143376

export class IntroScene extends Phaser.Scene {

  private readonly loadbar: Loadbar;

  private height: number;
  private width: number;
  private heightH: number;
  private widthH: number;

  private step = 1;

  constructor() {
    super({
      key: SceneNames.INTRO
    });

    this.loadbar = new Loadbar(this);
  }

  public preload() {
    this.loadbar.setup();

    this.load.atlas('flares', '../assets/fx/flares.png', '../assets/fx/flares.json');
    this.load.image('living-world', '../assets/img/intro-living-world.jpg');
    this.load.image('dead-world', '../assets/img/intro-dead-world.jpg');
    this.load.image('magic-world', '../assets/img/intro-magic-world.jpg');
    this.load.image('logo', '../assets/img/logo-white-100.png');
  }

  public create() {
    this.loadbar.destroy();

    this.height = this.game.config.height as number;
    this.width = this.game.config.width as number;
    this.heightH = this.height / 2;
    this.widthH = this.width / 2;

    this.cameras.main.setBounds(0, 0, this.height, this.width);

    this.createStep1();
  }

  public update() {
    switch (this.step) {
      case 1:
        this.updateStep1();
        break;
    }
  }

  private createStep1() {
    const explosion = this.add.graphics();
    explosion.setPosition(this.widthH, this.heightH);
    explosion.fillStyle(0xFFFFFF, 1.0);
    explosion.fillCircle(0, 0, 40);

    const particles = this.add.particles('flares');
    particles.createEmitter({
      frame: 'blue',
      x: this.widthH,
      y: this.heightH,
      lifespan: 2000,
      speed: { min: 400, max: 600 },
      angle: 330,
      gravityY: 300,
      scale: { start: 0.4, end: 0 },
      quantity: 2,
      blendMode: Phaser.BlendModes.ADD
    } as any);

    this.time.delayedCall(3000, () => {
      particles.destroy();
      explosion.destroy();

      this.createStep2();
    }, [], this);
  }

  private createStep2() {
    this.step = 2;

    const deadWorld = this.add.image(this.widthH, this.heightH, 'dead-world');
    const livingWorld = this.add.image(this.widthH, this.heightH, 'living-world');

    this.tweens.add({
      targets: livingWorld,
      alpha: 0,
      ease: 'Power1',
      duration: 3000,
      onComplete: () => {
        deadWorld.destroy();
        livingWorld.destroy();
        this.createStep3();
      }
    });
  }

  private createStep3() {
    this.step = 3;

    const magicWorld = this.add.image(this.widthH, this.heightH, 'magic-world');
    magicWorld.alpha = 0;
    this.tweens.add({
      targets: magicWorld,
      alpha: 1,
      ease: 'Power1',
      duration: 3000,
      onComplete: () => {
        magicWorld.destroy();
        this.createStep4();
      }
    });
  }

  private createStep4() {
    this.step = 4;

    // Show Player Sprite with Rainbow Animation
    const text = this.add.text(this.widthH, this.heightH, 'PLAYER', TextStyles.INTRO);

    this.time.delayedCall(3000, () => {
      text.destroy();
      this.createStep5();
    }, [], this);
  }

  private createStep5() {
    // TODO Fade out the logo again
    const logo = this.add.image(this.widthH, this.heightH, 'logo');
    logo.setOrigin(0.5);
    logo.alpha = 0;
    logo.setScale(0.8);

    this.tweens.add({
      targets: logo,
      alpha: 1,
      scaleX: 2,
      scaleY: 2,
      ease: 'Power1',
      duration: 8000,
      onComplete: () => {
        logo.destroy();
        this.createStep6();
      }
    });
  }

  private createStep6() {
    this.step = 6;
    const text = this.add.text(this.width - 500, this.height - 300, 'One world... one day...', TextStyles.INTRO);
    text.alpha = 0;
    this.tweens.add({
      targets: text,
      alpha: 1,
      ease: 'Power1',
      duration: 1000,
      onComplete: () => {
        this.time.delayedCall(2000, () => {
          this.scene.start(SceneNames.LOAD);
        }, [], this);
      }
    });
  }

  private updateStep1() {

  }

  public destroy() {
    LOG.debug('Free up intro resources');
    this.cache.destroy();
  }
}
