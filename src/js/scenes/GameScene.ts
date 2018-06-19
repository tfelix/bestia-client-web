import * as LOG from 'loglevel';

import { EntityStore, PlayerEntityHolder } from 'entities';
import { Point, AccountInfo } from 'model';
import { EngineContext } from 'engine/EngineContext';
import { EntityLocalFactory } from 'entities/EntityLocalFactory';
import { EntityRenderManager, CommonRenderManager } from 'engine/renderer';
import { ActionsRendererManager } from 'engine/renderer/actions/ActionsRenderManager';

const PLAYER_ACC_ID = 1;

export class GameScene extends Phaser.Scene {
  private controls: Phaser.Cameras.Controls.FixedKeyControl;

  private entityStore: EntityStore;
  private engineContext: EngineContext;

  private entityRenderManager: EntityRenderManager;
  private commonRenderManager: CommonRenderManager;
  private actionRenderManager: ActionsRendererManager;

  private entityFactory: EntityLocalFactory;

  constructor() {
    super({
      key: 'GameScene'
    });
  }

  public init(entityStore: EntityStore): void {
    this.entityStore = new EntityStore();
    const accountInfo = new AccountInfo('gast', PLAYER_ACC_ID, 'gast');
    const playerEntityHolder = new PlayerEntityHolder(accountInfo, this.entityStore);
    this.engineContext = new EngineContext(this, this.entityStore, playerEntityHolder);

    this.entityRenderManager = new EntityRenderManager(this.engineContext);
    this.commonRenderManager = new CommonRenderManager(this.engineContext);
    this.actionRenderManager = new ActionsRendererManager(this.engineContext);

    this.entityFactory = new EntityLocalFactory(this.entityStore);

    this.setupTestEnv();
  }

  public setupTestEnv() {
    const master = this.entityFactory.addSprite('player_1', new Point(2, 3));
    this.entityFactory.addPlayerComponent(master, PLAYER_ACC_ID);
    this.entityFactory.addDebugComponent(master);
    const rabbit = this.entityFactory.addSprite('rabbit', new Point(5, 6));
    this.entityFactory.addDebugComponent(rabbit);
    this.entityFactory.addConditionComponent(rabbit, 60, 100);
    const rabbit2 = this.entityFactory.addSprite('rabbit', new Point(12, 12));
    this.entityFactory.addConditionComponent(rabbit2);

    this.entityFactory.addObject('tree', new Point(10, 10));
    this.entityFactory.addObject('tree', new Point(14, 12));
    this.entityFactory.addObject('tree', new Point(18, 9));
    this.entityFactory.addObject('tree', new Point(6, 16));
    this.entityFactory.addObject('plant', new Point(3, 4));
    this.entityFactory.addObject('plant', new Point(10, 8));
    this.entityFactory.addObject('plant', new Point(7, 8));
    this.entityFactory.addObject('water', new Point(5, 8));

    this.engineContext.config.debug.renderCollision = false;
    this.engineContext.config.debug.renderInfo = false;

    /*this.time.addEvent({
      delay: 1000,
      repeat: 9,
      callback: () => {
        const dmg = Math.floor(Math.random() * 15 + 4);
        const dmgAction = new DamageAction(dmg);
        rabbit.actions.push(dmgAction);

        const chatAction = new ChatAction('Test', 'rocket');
        master.actions.push(chatAction);
      }
    });*/
  }

  public preload(): void {
    this.engineContext.pointerManager.load(this.load);
  }

  public create() {
    this.engineContext.game.input.mouse.disableContextMenu();

    const map = this.make.tilemap({ key: 'map' });
    const floorTiles = map.addTilesetImage('trees_plants_rocks', 'tiles');
    map.createStaticLayer('floor_0', floorTiles, 0, 0);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.engineContext.pointerManager.create();

    // Setup Keys
    this.input.keyboard.on('keydown_Q', () => {
      this.engineContext.config.debug.renderCollision = !this.engineContext.config.debug.renderCollision;
    });
    this.input.keyboard.on('keydown_W', () => {
      this.engineContext.config.debug.renderInfo = !this.engineContext.config.debug.renderInfo;
    });
  }

  public update(time, delta) {
    this.engineContext.pointerManager.update();

    this.entityRenderManager.update();
    this.actionRenderManager.update();
    this.commonRenderManager.update();

    this.engineContext.collisionUpdater.update();
  }
}
