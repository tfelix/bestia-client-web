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
import { DialogModalPlugin } from 'ui/DialogModalPlugin';
import { UiModalMessage } from 'message/UiMessages';
import { UIDataUpdater } from 'connection/UIDataUpdater';

export class GameScene extends Phaser.Scene {

  public dialogModal: DialogModalPlugin;

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
  private uiDataUpdater: UIDataUpdater;

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
      { handles: (msg) => msg instanceof UiModalMessage, routeTopic: Topics.IO_RECV_UI_MSG }
    ]);
    this.actionMessageHandler = new ActionMessageHandler(this.entityStore);
    this.connectionFacade = new ServerLocalFacade(this.entityStore);
  }

  /**
   * Must be done after messaging was setup and after the engine context was created.
   */
  private setupDataUpdater() {
    this.ecUpdater = new EntityComponentUpdater(this.entityStore);
    this.uiDataUpdater = new UIDataUpdater(this.engineContext);
  }

  public preload(): void {
    this.engineContext.pointerManager.load(this.load);
  }

  public create() {
    this.scene.launch('UiScene');
    this.engineContext.game.input.mouse.disableContextMenu();
    this.dialogModal.setup();

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

    this.entityRenderManager.create();
  }

  public update() {
    this.engineContext.pointerManager.update();

    this.entityRenderManager.update();
    this.actionRenderManager.update();
    this.commonRenderManager.update();

    this.engineContext.collisionUpdater.update();
  }
}
