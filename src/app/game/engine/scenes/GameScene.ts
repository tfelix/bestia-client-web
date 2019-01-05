import * as LOG from 'loglevel';
import { environment as env } from 'environments/environment';
import { EntityStore, PlayerEntityHolder } from 'app/game/entities';
import {
  ConnectionLogger, MessageRouter, UIDataUpdater, WeatherDataUpdater,
  EntityComponentUpdater
} from 'app/game/connection';
import {
  SyncRequestMessage, ActionMessage, ComponentMessage, ComponentDeleteMessage,
  AccountInfoMessage, UiModalMessage, WeatherMessage, sendToServer, EngineEvents
} from 'app/game/message';
import { AccountInfo } from 'app/game/model';

import { SceneNames } from './SceneNames';
import { EngineContext } from '../EngineContext';
import { EntityRenderManager } from '../renderer/component/EntityRenderManager';
import { CommonRenderManager } from '../renderer/common/CommonRenderManager';
import { ActionsRendererManager } from '../renderer/actions/ActionsRenderManager';
import { ActionMessageHandler } from '../renderer/actions/ActionMessageHandler';
import { LoginComponent } from 'app/login/login.component';

export class GameScene extends Phaser.Scene {

  private entityStore: EntityStore;
  public engineContext: EngineContext;

  private entityRenderManager: EntityRenderManager;
  private commonRenderManager: CommonRenderManager;
  private actionRenderManager: ActionsRendererManager;

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
      key: SceneNames.GAME
    });
    this.entityStore = new EntityStore();
  }

  public init(): void {
    const accountInfo = new AccountInfo();
    const playerEntityHolder = new PlayerEntityHolder(accountInfo, this.entityStore);
    this.engineContext = new EngineContext(this, this.entityStore, playerEntityHolder);

    this.entityRenderManager = new EntityRenderManager(this.engineContext);
    this.commonRenderManager = CommonRenderManager.standardInstance(this.engineContext);
    this.actionRenderManager = new ActionsRendererManager(this.engineContext);

    if (env.production) {
      this.connectionLogger = new ConnectionLogger();
    }

    this.engineContext.config.debug.renderCollision = false;
    this.engineContext.config.debug.renderInfo = false;

    // BOOTSTRAP CODE
    // THIS CODE MUST BE CREATED EVEN EARLIER BEFORE LOADING
    // GAME SCENE IS STARTED IF I KNOW HOW
    this.setupMessageRouting();
    this.setupDataUpdater();
  }

  private setupMessageRouting() {
    this.messageRouter = new MessageRouter([
      { handles: (msg) => msg instanceof ActionMessage, routeTopic: EngineEvents.IO_RECV_ACTION },
      { handles: (msg) => msg instanceof AccountInfoMessage, routeTopic: EngineEvents.IO_RECV_ACC_INFO_MSG },
      { handles: (msg) => msg instanceof ComponentMessage, routeTopic: EngineEvents.IO_RECV_COMP_MSG },
      { handles: (msg) => msg instanceof ComponentDeleteMessage, routeTopic: EngineEvents.IO_RECV_DEL_COMP_MSG },
      { handles: (msg) => msg instanceof UiModalMessage, routeTopic: EngineEvents.IO_RECV_UI_MSG },
      { handles: (msg) => msg instanceof WeatherMessage, routeTopic: EngineEvents.IO_RECV_WEATHER_MSG }
    ]);
    this.actionMessageHandler = new ActionMessageHandler(this.entityStore);
  }

  /**
   * Must be done after messaging was setup and after the engine context was created. These
   * updater will update non entity based data.
   */
  private setupDataUpdater() {
    this.ecUpdater = new EntityComponentUpdater(this.entityStore);
    this.uiDataUpdater = new UIDataUpdater(this.engineContext);
    this.weatherDataUpdater = new WeatherDataUpdater(this.engineContext);
  }

  public preload(): void {
    this.engineContext.pointerManager.load();
  }

  public create() {
    this.scene.launch(SceneNames.UI);

    const map = this.make.tilemap({ key: 'map' });

    const tiles1 = map.addTilesetImage('trees_plants_rocks', 'tiles_trees_plants_rocks');
    const tiles2 = map.addTilesetImage('town', 'tiles_town');
    const tiles3 = map.addTilesetImage('lost-garden_wood', 'tiles_wood_tileset');
    const tiles4 = map.addTilesetImage('lost-garden_mountain', 'tiles_mountain_tileset');

    const layer1 = map.createStaticLayer('Ebene 1', [tiles4, tiles3], 0, 0);
    const layer2 = map.createStaticLayer('Ebene 2', [tiles1, tiles4], 0, 0);
    const layer3 = map.createStaticLayer('Plants', [tiles1, tiles2, tiles3, tiles4], 0, 0);
    const layer4 = map.createStaticLayer('House', [tiles2], 0, 0);
    const layer5 = map.createStaticLayer('House 2', [tiles2], 0, 0);

    this.engineContext.data.tilemap = {
      map: map,
      layers: [layer1, layer2, layer3, layer4, layer5]
    };

    this.engineContext.collisionUpdater.resetCollisionMapSize();

    // TODO Investigate why there are 2 tiles missing in the height size of the map.
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels + 64);

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

    this.scene.launch(SceneNames.WEATHER, this.engineContext);

    // Needs to be in sync because certain events depending in this signal are
    // time dependend and need to be executed before the SyncRequestMessage is send.
    PubSub.publishSync(EngineEvents.GAME_READY, true);

    LOG.info('Engine loaded. Requesting sync with server');
    sendToServer(new SyncRequestMessage());
  }

  public update() {
    this.engineContext.pointerManager.update();
    this.engineContext.cursorManager.update();

    this.entityRenderManager.update();
    this.actionRenderManager.update();
    this.commonRenderManager.update();

    this.engineContext.collisionUpdater.update();
  }
}
