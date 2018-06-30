import { DisplayHelper } from "engine";

export class LoadScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'LoadScene'
    });
  }

  public preload(): void {
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

    const additionalObjects = ['tree', 'plant', 'water', 'sign'];
    additionalObjects.forEach(x => {
      const baseUrl = `../assets/sprites/object/${x}`;
      const pngUrl = `${baseUrl}/${x}.png`;
      const jsonUrl = `${baseUrl}/${x}.json`;
      this.load.atlas(x, pngUrl, jsonUrl);
      this.load.json(`${x}_desc`, `${baseUrl}/${x}_desc.json`);
    });

    // Load Music
    this.load.audio('click', ['../assets/audio/click.ogg'], {});

    // Load Tileset + Tilesheet
    this.load.image('tiles', '../assets/tilemap/tiles/trees_plants_rocks.png');
    this.load.tilemapTiledJSON('map', '../assets/tilemap/maps/demo.json');

    // Load Items
    this.load.image('empty_bottle', '../assets/sprites/items/empty_bottle.png');
    this.load.image('knife', '../assets/sprites/items/knife.png');

    // Tree Sprite

    // Misc
    this.load.glsl('shaderTest', '../assets/shader/test.frag');
    this.load.atlas(
      'ui',
      '../assets/ui/ui_elements.png',
      '../assets/ui/ui_elements.json'
    );
  }

  public create() {
    const text = this.add.text(DisplayHelper.sceneWidth / 2, DisplayHelper.sceneHeight / 2, 'Loading...');
  }

  public update(): void {
    this.scene.start('GameScene');
  }
}
