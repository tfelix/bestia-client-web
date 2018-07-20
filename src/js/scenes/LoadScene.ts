export class LoadScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'LoadScene'
    });
  }

  private setupProgressBar() {
    const progress = this.add.graphics();
    this.load.on('progress', (value) => {
      progress.clear();
      progress.fillStyle(0xFFFFFF, 1);
      progress.fillRect(100, 380, 600 * value, 30);
    });
    this.load.on('complete', () => progress.destroy());
  }

  public preload(): void {
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

    const additionalObjects = ['tree', 'plant', 'water', 'sign'];
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

    // Testing
    this.load.atlas(
      'fx_smoke',
      '../assets/fx/smoke.png',
      '../assets/fx/smoke.json'
    );
  }

  public create() {
    this.add.image(400, 300, 'splash-bg');

    const offscreen = new Phaser.Geom.Rectangle(-400, 300, 400, 300);
    const screen = new Phaser.Geom.Rectangle(-800, 0, 2000, 600);

    this.add.particles('cloud', [
      {
        emitZone: { source: offscreen },
        deathZone: { source: screen, type: 'onLeave' },
        frequency: 90000,
        quantity: 4,
        speedX: { min: 10, max: 15 },
        scale: { min: 0.8, max: 1 },
        lifespan: 60000
      },
      {
        emitZone: { source: offscreen },
        deathZone: { source: screen, type: 'onLeave' },
        frequency: 90000,
        quantity: 4,
        speedX: { min: 15, max: 30 },
        lifespan: 60000,
        scale: { min: 0.6, max: 0.8 },
      },
      {
        emitZone: { source: offscreen },
        deathZone: { source: screen, type: 'onLeave' },
        frequency: 90000,
        quantity: 4,
        speedX: { min: 30, max: 50 },
        scale: { min: 0.8, max: 1 },
        lifespan: 60000
      }
    ]);

    this.add.image(400, 200, 'logo');
  }

  public update(): void {
    this.scene.start('GameScene');
  }
}
