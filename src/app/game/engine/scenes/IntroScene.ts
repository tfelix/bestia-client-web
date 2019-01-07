import * as LOG from 'loglevel';
import { SceneNames } from './SceneNames';
import { Loadbar } from './Loadbar';
import { TextStyles } from '../TextStyles';
import { ShaderPipeline } from '../pipelines/ShaderPipeline';

class TextAnimator {

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

export class IntroScene extends Phaser.Scene {

  private readonly loadbar: Loadbar;

  private height: number;
  private width: number;
  private heightH: number;
  private widthH: number;

  // Step 1 + 2
  private creationPipeline: Phaser.Renderer.WebGL.WebGLPipeline;
  private creation: Phaser.GameObjects.Graphics;
  private explosionCircle: Phaser.Geom.Circle;
  private creationFadeTween: Phaser.Tweens.Tween;

  // Step 3

  // Step 7
  private textAnimator: TextAnimator;

  private sceneTime = 0;
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

    this.load.image('living-world', '../assets/img/landscape_by_joakimolofsson.jpg');
    this.load.image('dead-world', '../assets/img/sand_and_rock_by_joakimolofsson.jpg');
    this.load.image('magic-world', '../assets/img/summoning_by_joakimolofsson.jpg');
    this.load.image('logo', '../assets/img/logo-white-100.png');

    this.load.glsl('creation', '../assets/shader/creation.glsl');
  }

  public create() {
    this.loadbar.destroy();

    this.height = this.game.config.height as number;
    this.width = this.game.config.width as number;
    this.heightH = this.height / 2;
    this.widthH = this.width / 2;

    this.createStep1();
  }

  public update(time: number, delta: number) {
    switch (this.step) {
      case 1:
        this.updateStep1(time, delta);
        break;
      case 2:
        this.updateStep2(time, delta);
        break;
    }
  }

  private createStep1() {
    this.creation = this.add.graphics();
    this.creation.alpha = 0;
    this.creationPipeline = (this.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer)
      .addPipeline('creation', new ShaderPipeline(this.game, 'creation'));
    this.creationPipeline.setFloat2('u_resolution', this.width, this.height);
    this.creationPipeline.setFloat1('u_time', 4);
    this.creationPipeline.setFloat1('u_fade', 1);
    this.creation.setPipeline('creation');
    this.creation.fillRect(0, 0, this.width, this.height);

    this.explosionCircle = new Phaser.Geom.Circle(this.widthH, this.heightH, 10);

    const particles = this.add.particles('flares');
    const particleEmitter = particles.createEmitter({
      frame: 'blue',
      speed: { min: -100, max: 100 },
      scale: { start: 0.2, end: 0 },
      quantity: 50,
      blendMode: Phaser.BlendModes.ADD,
      emitZone: { type: 'random', source: this.explosionCircle }
    } as any);

    this.time.delayedCall(6000, () => {
      particleEmitter.explode(5000, 0, 0);
    }, [], this);

    this.time.delayedCall(6100, () => {
      this.cameras.main.flash(3000);
    }, [], this);

    this.time.delayedCall(7000, () => {
      this.creation.alpha = 1;
      this.sceneTime = 4000;
      this.step = 2;
    }, [], this);

    this.creationFadeTween = this.tweens.addCounter({
      from: 1,
      to: 0,
      duration: 3000,
      delay: 10000
    });

    this.time.delayedCall(14000, () => {
      this.creation.destroy();
      this.createStep3();
    }, [], this);
  }

  private createStep3() {
    this.step = 3;

    const livingWorld = this.add.image(this.widthH, this.heightH, 'living-world');
    livingWorld.displayWidth = this.width;
    const deadWorld = this.add.image(this.widthH, this.heightH, 'dead-world');
    deadWorld.displayWidth = this.width;
    deadWorld.alpha = 0;

    const timeline = this.tweens.createTimeline({});

    timeline.add({
      targets: deadWorld,
      alpha: 1,
      delay: 6000,
      duration: 2000,
      onComplete: () => {
        this.time.delayedCall(5000, () => {
          deadWorld.destroy();
          livingWorld.destroy();
          this.createStep4();
        }, [], this);
      }
    });

    timeline.play();
  }

  private createStep4() {
    this.step = 4;

    const magicWorld = this.add.image(this.widthH, this.heightH, 'magic-world');
    magicWorld.alpha = 0;
    this.tweens.add({
      targets: magicWorld,
      alpha: 1,
      ease: 'Power1',
      duration: 3000,
      onComplete: () => {
        magicWorld.destroy();
        this.createStep5();
      }
    });
  }

  private createStep5() {
    this.step = 5;

    // Show Player Sprite with Rainbow Animation
    const text = this.add.text(this.widthH, this.heightH, 'PLAYER', TextStyles.INTRO);

    this.time.delayedCall(3000, () => {
      text.destroy();
      this.createStep6();
    }, [], this);
  }

  private createStep6() {
    // TODO Fade out the logo again
    const logo = this.add.image(this.widthH, this.heightH, 'logo');
    logo.setOrigin(0.5);
    logo.alpha = 0;
    logo.setScale(0.8);

    const timeline = this.tweens.createTimeline({});

    timeline.add({
      targets: logo,
      alpha: 1,
      scaleX: 2,
      scaleY: 2,
      ease: 'Power1',
      duration: 8000
    });

    timeline.add({
      targets: logo,
      alpha: 0,
      ease: 'Power1',
      duration: 2000,
      onComplete: () => {
        this.time.delayedCall(500, () => {
          logo.destroy();
          this.createStep7();
        }, [], this);
      }
    });

    timeline.play();
  }

  private createStep7() {
    this.step = 7;
    const text = this.add.text(this.width - 500, this.height - 300, '', TextStyles.INTRO);
    text.setOrigin(0.5, 1);
    text.alpha = 0;

    const timeline = this.tweens.createTimeline({});

    timeline.add({
      targets: text,
      alpha: 1,
      ease: 'Power1',
      duration: 2000
    });

    timeline.add({
      targets: text,
      alpha: 0,
      ease: 'Power1',
      duration: 2000,
      delay: 5000,
      onComplete: () => {
        this.time.delayedCall(1000, () => {
          this.scene.start(SceneNames.LOAD);
        }, [], this);
      }
    });

    timeline.play();

    this.textAnimator = new TextAnimator(this, text);
    this.textAnimator.animateText('one world... on some day...');
  }

  private updateStep1(time: number, delta: number) {
    const r = this.sceneTime / 80 +
      + 80 * Math.abs(Math.sin(this.sceneTime / 800))
      + 30 * Math.abs(Math.sin(this.sceneTime / 500));
    this.explosionCircle.radius = r;

    this.sceneTime += delta;
  }

  private updateStep2(time: number, delta: number) {
    this.creationPipeline.setFloat1('u_time', this.sceneTime / 1000);
    this.creationPipeline.setFloat1('u_fade', this.creationFadeTween.getValue());
    console.log(this.creationFadeTween.getValue());
    this.sceneTime += delta;
  }

  public destroy() {
    LOG.debug('Free up intro resources');
    this.cache.destroy();
  }
}
