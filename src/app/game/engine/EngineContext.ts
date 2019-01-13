import * as EasyStar from 'easystarjs';

import { TranslationService } from 'app/game/connection';
import { InteractionService, PlayerEntityHolder, EntityStore } from 'app/game/entities';

import { DisplayHelper } from './DisplayHelper';
import { SpriteHelper } from './SpriteHelper';
import { PointerManager, CursorManager } from './pointer';
import { MoveHelper } from './MoveHelper';
import { GameData } from './GameData';
import { UiSounds } from './audio/StaticSoundHolder';
import { BuildingCollisions } from './BuildingCollisions';
import { CollisionMap } from './CollisionMap';

export class EngineConfig {

  public readonly debug = {
    renderCollision: false,
    renderGrid: false,
    renderInfo: false
  };

  constructor() {
  }
}

export class EngineContext {

  public mapGroup0: Phaser.GameObjects.Group;
  public pointerGroup: Phaser.GameObjects.Group;
  public pathfinder: EasyStar.js;
  public pointerManager: PointerManager;
  public cursorManager: CursorManager;

  public readonly config = new EngineConfig();
  public readonly data = new GameData();
  public readonly interactionCache = new InteractionService();
  public readonly i18n = new TranslationService();

  public readonly sound: UiSounds;

  public readonly helper: {
    display: DisplayHelper;
    sprite: SpriteHelper;
    move: MoveHelper;
  };

  public readonly collision: {
    map: CollisionMap;
    building: BuildingCollisions;
  };

  constructor(
    public readonly gameScene: Phaser.Scene,
    public readonly entityStore: EntityStore,
    public readonly playerHolder: PlayerEntityHolder
  ) {
    this.helper = {
      display: new DisplayHelper(this.gameScene),
      sprite: new SpriteHelper(this.gameScene),
      move: new MoveHelper(this)
    };

    this.mapGroup0 = this.gameScene.make.group({});

    this.pathfinder = new EasyStar.js();
    this.pathfinder.enableDiagonals();

    this.collision = {
      map: new CollisionMap(this),
      building: new BuildingCollisions(this)
    };


    this.pointerManager = new PointerManager(this);
    this.cursorManager = new CursorManager(this);

    this.sound = new UiSounds(gameScene);
  }
}
