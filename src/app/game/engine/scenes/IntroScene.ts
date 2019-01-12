import * as LOG from 'loglevel';
import { SceneNames } from './SceneNames';
import { Loadbar } from './Loadbar';
import { TextStyles } from '../TextStyles';
import { ShaderPipeline } from '../pipelines/ShaderPipeline';
import { TextAnimator } from '../TextAnimator';
import { BestiaButton } from '../BestiaButton';

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

  // Step 6
  private plasmaPipeline: Phaser.Renderer.WebGL.WebGLPipeline;

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

    this.load.audio('story', '../assets/audio/story.ogg');
    this.load.audio('explosion', '../assets/audio/explosion_medium.ogg');
    this.load.audio('bestia', '../assets/audio/bestia.ogg');

    this.load.atlas('flares', '../assets/fx/flares.png', '../assets/fx/flares.json');
    this.load.atlas('intro-chars', '../assets/sprites/mob/intro/intro-chars.png', '../assets/sprites/mob/intro/intro-chars.json');

    this.load.image('living-world', '../assets/img/landscape_by_joakimolofsson.jpg');
    this.load.image('dead-world', '../assets/img/sand_and_rock_by_joakimolofsson.jpg');
    this.load.image('magic-world', '../assets/img/summoning_by_joakimolofsson.jpg');
    this.load.image('logo', '../assets/img/logo-full-white.png');
    this.load.image('bg', '../assets/img/login_1.jpg');

    this.load.glsl('creation', '../assets/shader/creation.glsl');
    this.load.glsl('plasma', '../assets/shader/plasma.glsl');
  }

  public create() {
    this.loadbar.destroy();

    this.height = this.game.config.height as number;
    this.width = this.game.config.width as number;
    this.heightH = this.height / 2;
    this.widthH = this.width / 2;

    this.createStep0();
  }

  public update(time: number, delta: number) {
    switch (this.step) {
      case 1:
        this.updateStep1(time, delta);
        break;
      case 2:
        this.updateStep2(time, delta);
        break;
      case 5:
        this.updateStep5(time, delta);
        break;
    }
  }

  private createStep0() {
    this.step = 0;

    const bg = this.add.image(this.widthH, this.heightH, 'bg');
    bg.alpha = 0;
    this.tweens.add({
      targets: bg,
      alpha: 1,
      duration: 1000,
      ease: 'Power3'
    });

    const logo = this.add.image(this.widthH, this.heightH - 80, 'logo');
    logo.setOrigin(0.5);
    logo.alpha = 0;
    logo.setScale(0.8);
    logo.depth = 1;

    this.tweens.add({
      targets: logo,
      alpha: 1,
      y: '-= 20',
      duration: 1000,
      delay: 500,
      ease: 'Power3'
    });

    const bestiaAudio = this.sound.add('bestia');
    const explosionAudio = this.sound.add('explosion');

    const btn = new BestiaButton(this, this.widthH, this.heightH + 150, 'Start Game', TextStyles.INTRO, () => {
      this.time.delayedCall(150, () => {
        bestiaAudio.play();
      }, [], this);

      explosionAudio.play(undefined, { volume: 0.5 });
      this.tweens.add({
        targets: [logo, bg, btn],
        alpha: 0,
        duration: 1000,
        ease: 'Power3',
        onComplete: () => {
          btn.destroy();
          bg.destroy();
          logo.destroy();
          this.createStep1();
        }
      });
      this.cameras.main.flash(1000);
    });
    btn.alpha = 0;
    btn.setOrigin(0.5);
    btn.depth = 100;
    this.add.existing(btn);

    this.tweens.add({
      targets: btn,
      alpha: 1,
      duration: 1000,
      delay: 500,
      ease: 'Power3'
    });
  }

  private createStep1() {
    const storyAudio = this.sound.add('story');
    storyAudio.play();

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

    const livingWorld = this.add.image(0, 0, 'living-world');
    livingWorld.setDisplaySize(this.width, this.height);
    livingWorld.setOrigin(0, 0);
    livingWorld.setScale(Math.max(livingWorld.scaleX, livingWorld.scaleY) + 0.1);
    this.tweens.add({
      targets: livingWorld,
      duration: 6500,
      x: '-= 100'
    });

    const deadWorld = this.add.image(0, 0, 'dead-world');
    deadWorld.setOrigin(0, 0);
    deadWorld.setDisplaySize(this.width, this.height);
    deadWorld.setScale(Math.max(deadWorld.scaleX, deadWorld.scaleY) + 0.1);
    deadWorld.alpha = 0;

    this.tweens.add({
      targets: deadWorld,
      x: '-= 50',
      delay: 6000,
      duration: 7000,
    });

    this.tweens.add({
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
  }

  private createStep4() {
    this.step = 4;

    const magicWorld = this.add.image(this.widthH, this.heightH, 'magic-world');
    magicWorld.setDisplaySize(this.width, this.height);
    magicWorld.alpha = 0;

    this.tweens.add({
      targets: magicWorld,
      alpha: 1,
      ease: 'Power1',
      duration: 2000,
    });

    this.tweens.add({
      targets: magicWorld,
      scaleX: '+= 0.1',
      scaleY: '+= 0.1',
      duration: 5000,
      onComplete: () => {
        magicWorld.destroy();
        this.createStep5();
      }
    });
  }

  private createStep5() {
    this.step = 5;
    this.sceneTime = 0;

    this.plasmaPipeline = (this.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer)
      .addPipeline('plasma', new ShaderPipeline(this.game, 'plasma'));
    this.plasmaPipeline.setFloat2('u_resolution', this.width, this.height);

    const male = this.add.sprite(this.widthH - 150, this.heightH, 'intro-chars', 'male-001.png');
    male.setScale(2);
    male.alpha = 0;
    male.on('animationcomplete', () => {
      male.setFrame('male-001.png');
    });

    const frameNamesMale = this.anims.generateFrameNames('intro-chars', {
      start: 1,
      end: 8,
      zeroPad: 3,
      prefix: 'male-',
      suffix: '.png'
    });
    this.anims.create({ key: 'attack-male', frames: frameNamesMale, frameRate: 6, repeat: 1 });

    const female = this.add.sprite(this.widthH + 150, this.heightH, 'intro-chars', 'female-001.png');
    female.setScale(2);
    female.alpha = 0;
    female.on('animationcomplete', () => {
      female.setFrame('female-001.png');
    });

    const frameNamesFemale = this.anims.generateFrameNames('intro-chars', {
      start: 1,
      end: 7,
      zeroPad: 3,
      prefix: 'female-',
      suffix: '.png'
    });
    this.anims.create({ key: 'attack-female', frames: frameNamesFemale, frameRate: 6, repeat: 1 });

    [female, male].forEach(s => {
      this.tweens.add({
        targets: s,
        alpha: 1,
        ease: 'Power1',
        duration: 2000
      });
    });

    this.time.delayedCall(3000, () => {
      female.anims.play('attack-female');
      male.anims.play('attack-male');
    }, [], this);

    this.time.delayedCall(4500, () => {
      female.setPipeline('plasma');
      male.setPipeline('plasma');
    }, [], this);

    this.tweens.add({
      targets: male,
      alpha: 0,
      ease: 'Power1',
      duration: 2000,
      delay: 7000
    });
    this.tweens.add({
      targets: female,
      alpha: 0,
      ease: 'Power1',
      duration: 2000,
      delay: 7000
    });

    this.time.delayedCall(9000, () => {
      female.destroy();
      male.destroy();
      this.createStep6();
    }, [], this);
  }

  private createStep6() {
    this.cameras.main.flash();
    const logo = this.add.image(this.widthH, this.heightH, 'logo');
    logo.setOrigin(0.5);
    logo.alpha = 0;
    logo.setScale(0.5);

    const timeline = this.tweens.createTimeline({});

    timeline.add({
      targets: logo,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
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
    this.sceneTime += delta;
  }

  private updateStep5(time: number, delta: number) {
    this.plasmaPipeline.setFloat1('u_time', this.sceneTime / 1000);
    this.sceneTime += delta;
  }

  public destroy() {
    LOG.debug('Free up intro resources');
    this.cache.destroy();
  }
}
