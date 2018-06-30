import { EntityStore, PlayerEntityHolder } from 'entities';
import { EngineContext } from 'engine/EngineContext';
import { EntityRenderManager, CommonRenderManager } from 'engine/renderer';
import { ActionsRendererManager } from 'engine/renderer/actions/ActionsRenderManager';
import { ConnectionLogger } from 'connection/ConnectionLogger';
import { MessageRouter } from 'connection/MessageRouter';
import { ActionMessageHandler } from 'engine/renderer/actions/ActionMessageHandler';
import { SyncRequestMessage, ActionMessage, ComponentMessage, ComponentDeleteMessage, AccountInfoMessage } from 'message';
import { Topics } from 'Topics';
import { EntityComponentUpdater } from 'connection/EntityComponentUpdater';
import { AccountInfo } from 'model';
import { ServerLocalFacade } from 'demo';

export class GameScene extends Phaser.Scene {
  private entityStore: EntityStore;
  private engineContext: EngineContext;

  private entityRenderManager: EntityRenderManager;
  private commonRenderManager: CommonRenderManager;
  private actionRenderManager: ActionsRendererManager;

  private connectionFacade: ServerLocalFacade;
  private connectionLogger: ConnectionLogger;

  // BOOTSTRAP
  private messageRouter: MessageRouter;
  private actionMessageHandler: ActionMessageHandler;
  private ecUpdater: EntityComponentUpdater;
  // /BOOTSTRAP
  constructor() {
    super({
      key: 'GameScene'
    });

    // BOOTSTRAP CODE
    // THIS CODE MUST BE CREATED EVEN EARLIER BEFORE LOADING
    // GAME SCENE IS STARTED IF I KNOW HOW
    this.entityStore = new EntityStore();
    this.setupMessaging();
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

    PubSub.publish(Topics.IO_SEND_MSG, new SyncRequestMessage());
  }

  private setupMessaging() {
    this.messageRouter = new MessageRouter([
      { handles: (msg) => msg instanceof ActionMessage, routeTopic: Topics.IO_RECV_ACTION },
      { handles: (msg) => msg instanceof AccountInfoMessage, routeTopic: Topics.IO_RECV_ACC_INFO_MSG },
      { handles: (msg) => msg instanceof ComponentMessage, routeTopic: Topics.IO_RECV_COMP_MSG },
      { handles: (msg) => msg instanceof ComponentDeleteMessage, routeTopic: Topics.IO_RECV_DEL_COMP_MSG },
    ]);
    this.actionMessageHandler = new ActionMessageHandler(this.entityStore);
    this.ecUpdater = new EntityComponentUpdater(this.entityStore);
    this.connectionFacade = new ServerLocalFacade(this.entityStore);
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
