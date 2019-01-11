import { SceneNames } from './SceneNames';
import { UIAtlasBase, UIAtlasFx, UIConstants } from 'app/game/ui';
import { Loadbar } from './Loadbar';

export class LoadScene extends Phaser.Scene {

  private readonly loadbar: Loadbar;

  constructor() {
    super({
      key: SceneNames.LOAD
    });

    this.loadbar = new Loadbar(this);
  }

  public preload(): void {
    this.loadbar.setup();

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

    const additionalObjectEntities = ['tree', 'tree_01', 'plant', 'water', 'sign'];
    additionalObjectEntities.forEach(x => {
      const baseUrl = `../assets/sprites/objects/${x}`;
      const pngUrl = `${baseUrl}/${x}.png`;
      const jsonUrl = `${baseUrl}/${x}.json`;
      this.load.atlas(x, pngUrl, jsonUrl);
      this.load.json(`${x}_desc`, `${baseUrl}/${x}_desc.json`);
    });

    const additionalBuildingEntities = ['simple_cabin_1'];
    additionalBuildingEntities.forEach(x => {
      const baseUrl = '../assets/sprites/buildings';
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

    // Shader
    this.load.glsl('weather', '../assets/shader/weather.glsl');

    // Misc
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
