import { UIAtlasFx, UIAtlasBase, UIConstants } from '../ui';
import { SceneNames } from './SceneNames';
import { TextStyles } from '../engine/TextStyles';

export class LoadScene extends Phaser.Scene {
  constructor() {
    super({
      key: SceneNames.LOAD
    });
  }

  private loadBar: Phaser.GameObjects.Graphics;
  private loaderText: Phaser.GameObjects.Text;

  private halfWidth: number;
  private halfHeight: number;

  private setupProgressBar() {
    this.loaderText = this.add.text(this.halfWidth, this.halfHeight, '0 %', TextStyles.LOADER);
    this.loaderText.setOrigin(0.5);

    this.loadBar = this.add.graphics();
    this.loadBar.x = this.halfWidth;
    this.loadBar.y = this.halfHeight;

    this.loadBar.lineStyle(20, 0xf2f2f2, 1);
    this.loadBar.beginPath();
    this.loadBar.arc(0, 0, 130, 0, Phaser.Math.DegToRad(370), false, 0.03);
    this.loadBar.strokePath();
    this.loadBar.closePath();

    this.load.on('progress', progressValue => {
      this.loadBar.clear();
      this.loaderText.text = `${Math.round(progressValue * 100)} %`;
      this.loadBar.beginPath();
      this.loadBar.lineStyle(20, 0xf2f2f2, 1);
      this.loadBar.arc(0, 0, 130, 0, Phaser.Math.DegToRad(370 * progressValue), false, 0.03);
      this.loadBar.strokePath();
      this.loadBar.closePath();
    });
  }

  public preload(): void {
    this.halfWidth = this.game.config.width as number / 2;
    this.halfHeight = this.game.config.height as number / 2;

    this.setupProgressBar();

    // Load Player Sprite
    this.load.json('player_1_desc', '../assets/sprites/mob/player_1/player_1_desc.json');
    this.load.atlas(
      'player_1',
      '../assets/sprites/mob/player_1/player_1.png',
      '../assets/sprites/mob/player_1/player_1.json'
    );

    this.load.json('rabbit_desc', '../assets/sprites/mob/rabbit/rabbit_desc.json');
    this.load.atlas(
      'rabbit',
      '../assets/sprites/mob/rabbit/rabbit.png',
      '../assets/sprites/mob/rabbit/rabbit.json'
    );

    const additionalObjects = ['tree', 'tree_01', 'plant', 'water', 'sign'];
    additionalObjects.forEach(x => {
      const baseUrl = `../assets/sprites/object/${x}`;
      const pngUrl = `${baseUrl}/${x}.png`;
      const jsonUrl = `${baseUrl}/${x}.json`;
      this.load.atlas(x, pngUrl, jsonUrl);
      this.load.json(`${x}_desc`, `${baseUrl}/${x}_desc.json`);
    });

    // Load Music
    const audioObjects = ['click', 'rollover'];
    audioObjects.forEach(x => {
      this.load.audio(x, [`../assets/audio/${x}.ogg`, `../assets/audio/${x}.mp3`], {});
    });

    // Load Tileset + Tilesheet
    this.load.image('tiles_trees_plants_rocks', '../assets/tilemap/tiles/trees_plants_rocks.png');
    this.load.image('tiles_town', '../assets/tilemap/tiles/town.png');
    this.load.image('tiles_wood_tileset', '../assets/tilemap/tiles/wood_tileset.png');
    this.load.image('tiles_mountain_tileset', '../assets/tilemap/tiles/mountain_landscape.png');
    this.load.tilemapTiledJSON('map', '../assets/tilemap/maps/intro.json');

    // Load Items
    const itemNames = ['empty_bottle', 'knife', 'fish'];
    itemNames.forEach(x => this.load.image(x, `../assets/sprites/items/${x}.png`));

    // Tree Sprite

    // Misc
    this.load.image('cloud_shadows', '../assets/fx/clouds.png');
    this.load.glsl('shaderTest', '../assets/shader/test.frag');
    this.load.atlas(
      UIAtlasBase,
      '../assets/base.png',
      '../assets/base.json'
    );
    this.load.atlas(
      UIAtlasFx,
      '../assets/fx/fx.png',
      '../assets/fx/fx.json'
    );

    // Testing
    this.load.image(
      'fx_smoke_temp',
      '../assets/fx/_muzzle.png'
    );
    this.load.atlas(
      'fx_smoke',
      '../assets/fx/smoke.png',
      '../assets/fx/smoke.json'
    );
  }

  public create() {
    this.createBaseAnimations();
  }

  /**
   * Creates the animations setup in the base ui file.
   */
  private createBaseAnimations() {
    this.anims.create({
      key: UIConstants.FISHING_ANIM_SWIMMER,
      frames: this.anims.generateFrameNames(
        UIAtlasBase,
        { prefix: 'swimmer_', end: 2, zeroPad: 3, suffix: '.png' }
      ),
      repeat: -1,
      frameRate: 1
    });

    this.anims.create({
      key: UIConstants.FISHING_ANIM_SWIMMER_BITTEN,
      frames: this.anims.generateFrameNames(
        UIAtlasBase,
        { prefix: 'swimmer-bitten_', end: 2, zeroPad: 3, suffix: '.png' }
      ),
      repeat: -1,
      frameRate: 1
    });
  }


  public update(): void {
    this.scene.start(SceneNames.GAME);
  }
}
