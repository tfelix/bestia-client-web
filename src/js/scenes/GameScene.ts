import { EntityStore, PlayerEntityHolder } from 'entities';
import { EngineContext } from 'engine/EngineContext';
import { EntityRenderManager, CommonRenderManager } from 'engine/renderer';
import { ActionsRendererManager } from 'engine/renderer/actions/ActionsRenderManager';
import { ConnectionLogger } from 'connection/ConnectionLogger';
import { MessageRouter } from 'connection/MessageRouter';
import { UIDataUpdater } from 'connection/UIDataUpdater';
import { ActionMessageHandler } from 'engine/renderer/actions/ActionMessageHandler';
import { SyncRequestMessage, ActionMessage, ComponentMessage, ComponentDeleteMessage, AccountInfoMessage } from 'message';
import { EntityComponentUpdater } from 'connection/EntityComponentUpdater';
import { AccountInfo, Point } from 'model';
import { UiModalMessage } from 'message/UiMessages';
import { SceneNames } from './SceneNames';
import { BlendModes } from 'phaser';
import { Topics, ServerEmulator, WeatherDataUpdater } from 'connection';
import { WeatherMessage } from 'message/WeatherDataMessage';
import { MapHelper } from 'map';

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

    if (DEV) {
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
    // this.weatherDataUpdater = new WeatherDataUpdater(this.engineContext);
  }

  public preload(): void {
    this.engineContext.pointerManager.load(this.load);
  }

  public create() {
    this.engineContext.game.input.mouse.disableContextMenu();

    this.scene.launch(SceneNames.UI);

    const map = this.make.tilemap({ key: 'map' });
    const floorTiles = map.addTilesetImage('trees_plants_rocks', 'tiles');
    map.createStaticLayer('floor_0', floorTiles, 0, 0);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Setup Keys
    this.input.keyboard.on('keydown_Q', () => {
      this.engineContext.config.debug.renderCollision = !this.engineContext.config.debug.renderCollision;
    });
    this.input.keyboard.on('keydown_W', () => {
      this.engineContext.config.debug.renderInfo = !this.engineContext.config.debug.renderInfo;
    });

    this.entityRenderManager.create();
    this.commonRenderManager.create();

    this.engineContext.pointerManager.create();
    this.engineContext.cursorManager.create();

    this.serverEmulator.create();

    this.createParticleTest(new Point(15, 13));
    this.createParticleTest(new Point(20, 10));
  }

  private createParticleTest(pos: Point) {

    const px = MapHelper.pointToPixel(pos);

    const fire = this.add.particles('fx_smoke_temp').createEmitter({
      x: px.x,
      y: px.y,
      speed: { min: 80, max: 160 },
      angle: { min: -85, max: -95 },
      scale: { start: 0, end: 0.5, ease: 'Back.easeOut' },
      alpha: { start: 1, end: 0, ease: 'Quart.easeOut' },
      blendMode: BlendModes.ADD,
      lifespan: 1000
    });
    fire.manager.depth = 10000;

    const whiteSmoke = this.add.particles('fx_smoke').createEmitter({
      frames: ['flame_02.png'],
      x: px.x,
      y: px.y,
      speed: { min: 20, max: 100 },
      angle: { min: -85, max: -95 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0, end: 0.5 },
      lifespan: 2000,
    });
    whiteSmoke.reserve(1000);

    const darkSmoke = this.add.particles('fx_smoke').createEmitter({
      x: px.x,
      y: px.y,
      speed: { min: 20, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0, end: 0.1 },
      lifespan: 2000,
      active: false
    });
    darkSmoke.reserve(1000);

    fire.onParticleDeath(particle => {
      darkSmoke.setPosition(particle.x, particle.y + 40);
      whiteSmoke.setPosition(particle.x, particle.y + 40);
      darkSmoke.emitParticle();
      whiteSmoke.emitParticle();
    });
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
