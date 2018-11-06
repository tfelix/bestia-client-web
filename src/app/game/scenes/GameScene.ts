import { environment as env } from 'app/../environments/environment';
import { EntityStore, PlayerEntityHolder } from 'app/game/entities';
import {
  EngineContext, EntityRenderManager, CommonRenderManager, ActionsRendererManager,
  ActionMessageHandler, MapHelper
} from 'app/game/engine';
import {
  ConnectionLogger, MessageRouter, UIDataUpdater, Topics, WeatherDataUpdater,
  EntityComponentUpdater
} from 'app/game/connection';
import {
  SyncRequestMessage, ActionMessage, ComponentMessage, ComponentDeleteMessage,
  AccountInfoMessage, UiModalMessage, WeatherMessage
} from 'app/game/message';
import { ServerEmulator } from 'app/game/demo';
import { AccountInfo, Point } from 'app/game/model';

import { SceneNames } from './SceneNames';

export class GameScene extends Phaser.Scene {

  private entityStore: EntityStore;
  private engineContext: EngineContext;

  private entityRenderManager: EntityRenderManager;
  private commonRenderManager: CommonRenderManager;
  private actionRenderManager: ActionsRendererManager;

  private serverEmulator: ServerEmulator;
  private connectionLogger: ConnectionLogger;

  // BOOTSTRAP
  private messageRouter: MessageRouter;
  private actionMessageHandler: ActionMessageHandler;
  private ecUpdater: EntityComponentUpdater;
  private uiDataUpdater: UIDataUpdater;
  private weatherDataUpdater: WeatherDataUpdater;

  // /BOOTSTRAP
  constructor() {
    super({
      key: 'GameScene'
    });
    this.entityStore = new EntityStore();
  }

  public init(entityStore: EntityStore): void {
    const accountInfo = new AccountInfo();
    const playerEntityHolder = new PlayerEntityHolder(accountInfo, this.entityStore);
    this.engineContext = new EngineContext(this, this.entityStore, playerEntityHolder);

    this.entityRenderManager = new EntityRenderManager(this.engineContext);
    this.commonRenderManager = new CommonRenderManager(this.engineContext);
    this.actionRenderManager = new ActionsRendererManager(this.engineContext);

    if (env.production) {
      this.connectionLogger = new ConnectionLogger();
    }

    this.engineContext.config.debug.renderCollision = false;
    this.engineContext.config.debug.renderInfo = false;

    // BOOTSTRAP CODE
    // THIS CODE MUST BE CREATED EVEN EARLIER BEFORE LOADING
    // GAME SCENE IS STARTED IF I KNOW HOW
    this.setupMessaging();
    this.setupDataUpdater();

    PubSub.publish(Topics.IO_SEND_MSG, new SyncRequestMessage());
  }

  private setupMessaging() {
    this.messageRouter = new MessageRouter([
      { handles: (msg) => msg instanceof ActionMessage, routeTopic: Topics.IO_RECV_ACTION },
      { handles: (msg) => msg instanceof AccountInfoMessage, routeTopic: Topics.IO_RECV_ACC_INFO_MSG },
      { handles: (msg) => msg instanceof ComponentMessage, routeTopic: Topics.IO_RECV_COMP_MSG },
      { handles: (msg) => msg instanceof ComponentDeleteMessage, routeTopic: Topics.IO_RECV_DEL_COMP_MSG },
      { handles: (msg) => msg instanceof UiModalMessage, routeTopic: Topics.IO_RECV_UI_MSG },
      { handles: (msg) => msg instanceof WeatherMessage, routeTopic: Topics.IO_RECV_WEATHER_MSG }
    ]);
    this.actionMessageHandler = new ActionMessageHandler(this.entityStore);
    this.serverEmulator = new ServerEmulator(this.entityStore);
  }

  /**
   * Must be done after messaging was setup and after the engine context was created.
   */
  private setupDataUpdater() {
    this.ecUpdater = new EntityComponentUpdater(this.entityStore);
    this.uiDataUpdater = new UIDataUpdater(this.engineContext);
    this.weatherDataUpdater = new WeatherDataUpdater(this.engineContext);
  }

  public preload(): void {
    this.engineContext.pointerManager.load(this.load);
  }

  public create() {
    this.scene.launch(SceneNames.UI);

    const map = this.make.tilemap({ key: 'map' });

    const tiles1 = map.addTilesetImage('trees_plants_rocks', 'tiles_trees_plants_rocks');
    const tiles2 = map.addTilesetImage('town', 'tiles_town');
    const tiles3 = map.addTilesetImage('lost-garden_wood', 'tiles_wood_tileset');
    const tiles4 = map.addTilesetImage('lost-garden_mountain', 'tiles_mountain_tileset');

    map.createStaticLayer('Ebene 1', [tiles4, tiles3], 0, 0);
    map.createStaticLayer('Ebene 2', [tiles1, tiles4], 0, 0);
    map.createStaticLayer('Plants', [tiles1, tiles2, tiles3, tiles4], 0, 0);
    map.createStaticLayer('House', [tiles2], 0, 0);
    map.createStaticLayer('House 2', [tiles2], 0, 0);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Setup Keys
    this.input.keyboard.on('keydown_Q', () => {
      this.engineContext.config.debug.renderCollision = !this.engineContext.config.debug.renderCollision;
    });
    this.input.keyboard.on('keydown_W', () => {
      this.engineContext.config.debug.renderInfo = !this.engineContext.config.debug.renderInfo;
    });
    this.input.keyboard.on('keydown_E', () => {
      this.engineContext.config.debug.renderGrid = !this.engineContext.config.debug.renderGrid;
    });

    this.entityRenderManager.create();
    this.commonRenderManager.create();

    this.engineContext.pointerManager.create();
    this.engineContext.cursorManager.create();

    this.serverEmulator.create();
  }

  public update() {
    this.serverEmulator.update();

    this.engineContext.pointerManager.update();
    this.engineContext.cursorManager.update();

    this.entityRenderManager.update();
    this.actionRenderManager.update();
    this.commonRenderManager.update();

    this.engineContext.collisionUpdater.update();
  }
}
