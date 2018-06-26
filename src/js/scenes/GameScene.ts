import { EntityStore, PlayerEntityHolder } from 'entities';
import { Point, AccountInfo } from 'model';
import { EngineContext } from 'engine/EngineContext';
import { EntityLocalFactory } from 'entities/EntityLocalFactory';
import { EntityRenderManager, CommonRenderManager } from 'engine/renderer';
import { ActionsRendererManager } from 'engine/renderer/actions/ActionsRenderManager';
import { ServerLocalFacade } from 'connection/ServerLocalFacade';
import { ConnectionLogger } from 'connection/ConnectionLogger';
import { MessageRouter } from 'connection/MessageRouter';
import { ActionMessageHandler } from 'engine/renderer/actions/ActionMessageHandler';
import { ComponentMessageHandler } from 'entities/components/ComponentMessageHandler';
import { SpriteCollision } from 'map/SpriteCollision';

const PLAYER_ACC_ID = 1;

export class GameScene extends Phaser.Scene {
  private entityStore: EntityStore;
  private engineContext: EngineContext;

  private entityRenderManager: EntityRenderManager;
  private commonRenderManager: CommonRenderManager;
  private actionRenderManager: ActionsRendererManager;

  private entityFactory: EntityLocalFactory;

  private connectionFacade: ServerLocalFacade;
  private connectionLogger: ConnectionLogger;

  // BOOTSTRAP
  private messageRouter: MessageRouter;
  private actionMessageHandler: ActionMessageHandler;
  private componentMessageHandler: ComponentMessageHandler;
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

    // EntityStore
    // Connection Stuff
    // Connection Handler
    // Renderer Stuff
  }

  public init(entityStore: EntityStore): void {
    const accountInfo = new AccountInfo('gast', PLAYER_ACC_ID, 'gast');
    const playerEntityHolder = new PlayerEntityHolder(accountInfo, this.entityStore);
    this.engineContext = new EngineContext(this, this.entityStore, playerEntityHolder);

    this.entityRenderManager = new EntityRenderManager(this.engineContext);
    this.commonRenderManager = new CommonRenderManager(this.engineContext);
    this.actionRenderManager = new ActionsRendererManager(this.engineContext);

    this.entityFactory = new EntityLocalFactory(this.entityStore);

    if (DEV) {
      this.connectionLogger = new ConnectionLogger();
    }

    this.setupTestEnv();
  }

  private setupMessaging() {
    this.messageRouter = new MessageRouter();
    this.actionMessageHandler = new ActionMessageHandler(this.entityStore);
    this.componentMessageHandler = new ComponentMessageHandler(this.entityStore);
    this.connectionFacade = new ServerLocalFacade(this.entityStore);
  }

  private setupTestEnv() {
    const master = this.entityFactory.addPlayer('player_1', new Point(2, 3));
    this.entityFactory.addPlayerComponent(master, PLAYER_ACC_ID);
    this.entityFactory.addBestia('rabbit', new Point(5, 6));
    this.entityFactory.addBestia('rabbit', new Point(12, 12));

    this.entityFactory.addObject('tree', new Point(10, 10));
    this.entityFactory.addObject('tree', new Point(14, 12));
    this.entityFactory.addObject('tree', new Point(18, 9));
    this.entityFactory.addObject('tree', new Point(6, 16));
    this.entityFactory.addObject('plant', new Point(3, 4));
    this.entityFactory.addObject('plant', new Point(10, 8));
    this.entityFactory.addObject('plant', new Point(7, 8));
    this.entityFactory.addObject('water', new Point(5, 8));
    this.entityFactory.addObject('sign', new Point(2, 8));

    this.entityFactory.addItem('empty_bottle', 2, new Point(3, 12));
    this.entityFactory.addItem('empty_bottle', 1, new Point(7, 18));
    this.entityFactory.addItem('knife', 1, new Point(12, 10));
    this.entityFactory.addItem('knife', 1, new Point(3, 6));

    this.engineContext.config.debug.renderCollision = false;
    this.engineContext.config.debug.renderInfo = false;
  }

  public preload(): void {
    this.engineContext.pointerManager.load(this.load);
  }

  public create() {
    // TODO Test
    const desc = this.cache.json.get('tree_desc');
    const test = new SpriteCollision(new Point(10, 10), desc);
    console.log(test.hasCollision(new Point(10, 10)));
    console.log(test.hasCollision(new Point(11, 10)));
    console.log(test.hasCollision(new Point(12, 10)));
    console.log(test.hasCollision(new Point(10, 9)));
    console.log(test.hasCollision(new Point(10, 5)));

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
