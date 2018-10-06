import * as EasyStar from 'easystarjs';

import { TranslationService } from 'app/game/connection';
import { CollisionUpdater } from 'app/game/map';
import { InteractionCache, PlayerEntityHolder, EntityStore } from 'app/game/entities';

import { DisplayHelper } from './DisplayHelper';
import { SpriteHelper } from './SpriteHelper';
import { PointerManager, CursorManager } from './pointer';
import { MoveHelper } from './MoveHelper';
import { GameData } from '.';
import { StaticSoundHolder } from './StaticSoundHolder';

export class EngineConfig {

  public readonly debug = {
    renderCollision: false,
    renderInfo: false
  };

  constructor() {
  }
}

export class EngineContext {

  public mapGroup0: Phaser.GameObjects.Group;
  public pointerGroup: Phaser.GameObjects.Group;
  public pathfinder: EasyStar.js;
  public collisionUpdater: CollisionUpdater;
  public pointerManager: PointerManager;
  public cursorManager: CursorManager;

  public readonly config = new EngineConfig();
  public readonly data = new GameData();
  public readonly interactionCache = new InteractionCache();
  public readonly i18n = new TranslationService();

  public readonly sound: StaticSoundHolder;

  public readonly helper: {
    display: DisplayHelper;
    sprite: SpriteHelper;
    move: MoveHelper;
  };

  constructor(
    public readonly game: Phaser.Scene,
    public readonly entityStore: EntityStore,
    public readonly playerHolder: PlayerEntityHolder
  ) {
    this.helper = {
      display: new DisplayHelper(this.game),
      sprite: new SpriteHelper(this.game),
      move: new MoveHelper(this)
    };

    this.mapGroup0 = this.game.make.group({});

    this.pathfinder = new EasyStar.js();
    this.pathfinder.enableDiagonals();

    this.collisionUpdater = new CollisionUpdater(this);
    this.pointerManager = new PointerManager(this);
    this.cursorManager = new CursorManager(this);

    this.sound = new StaticSoundHolder(game);
  }
}