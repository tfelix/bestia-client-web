import { SyncRequestMessage, AccountInfoMessage, ComponentMessage } from 'app/game/message';
import { MoveComponent, FxComponent, ProjectileComponent } from 'app/game/entities';
import { Point } from 'app/game/model';

import { EntityLocalFactory, BuildingData } from './EntityLocalFactory';
import { ServerEntityStore } from './ServerEntityStore';
import { ClientMessageHandler } from './ClientMessageHandler';

export class RequestSyncHandler extends ClientMessageHandler<SyncRequestMessage> {

  constructor(
    serverEntities: ServerEntityStore,
    private readonly playerAccId: number,
    private readonly entityFactory: EntityLocalFactory
  ) {
    super(serverEntities);
  }

  public isHandlingMessage(msg: any): boolean {
    return msg instanceof SyncRequestMessage;
  }

  public handle(msg: SyncRequestMessage) {
    const accInfoMsg = new AccountInfoMessage('roggy', this.playerAccId, 'master');
    this.sendClient(accInfoMsg);

    // const comps = this.entityFactory.addPlayer('player_1', new Point(83, 95), this.playerAccId);
    const comps = this.entityFactory.addPlayer('player_1', new Point(18, 95), this.playerAccId);
    this.sendAllComponents(comps);
    const playerEntityId = this.entityFactory.getLastInsertedEntityId();

    // Left as an example how to add the fishing component.
    window.setTimeout(() => {
      const fishingComp = this.entityFactory.addFishingComponent(playerEntityId);
      fishingComp.targetPoint = { x: 23, y: 98 };
      this.sendComponent(fishingComp);
    });

    // TODO Handle AI differently
    const bestiaComps = this.entityFactory.addBestia('rabbit', new Point(16, 89));
    const entityId = bestiaComps[0].entityId;
    window.setTimeout(() => {
      const moveComp = new MoveComponent(23456, entityId);
      moveComp.path = [
        new Point(16, 89),
        new Point(16, 90),
        new Point(16, 90),
        new Point(15, 90),
        new Point(16, 90),
        new Point(16, 91),
        new Point(16, 92)
      ];
      this.sendClient(new ComponentMessage<MoveComponent>(moveComp));
    }, 2000);
    this.sendAllComponents(bestiaComps);

    // The creation of the server side entities should be done in a seperate code part
    // fueld by the game demo scripts.
    this.sendAllComponents(this.entityFactory.addBestia('rabbit', new Point(23, 93)));

    this.sendAllComponents(this.entityFactory.addObject('tree', new Point(31, 87)));
    this.sendAllComponents(this.entityFactory.addObject('tree', new Point(30, 93)));
    this.sendAllComponents(this.entityFactory.addObject('tree', new Point(13, 97)));

    this.sendAllComponents(this.entityFactory.addObject('tree_01', new Point(75, 95)));

    this.sendAllComponents(this.entityFactory.addObject('tree', new Point(6, 16)));
    const treeEntityId = this.entityFactory.getLastInsertedEntityId();
    const treeEntity = this.serverEntities.getEntity(treeEntityId);
    const fxCompTree = this.entityFactory.addFx(treeEntity)[0] as FxComponent;
    fxCompTree.fxTags.add('BURNING');
    this.sendAllComponents([fxCompTree]);
    this.sendAllComponents(this.entityFactory.addDebugComponent(treeEntity));

    this.sendAllComponents(this.entityFactory.addObject('plant', new Point(15, 89)));
    this.sendAllComponents(this.entityFactory.addObject('plant', new Point(18, 90)));
    this.sendAllComponents(this.entityFactory.addObject('plant', new Point(20, 88)));

    this.sendAllComponents(this.entityFactory.addObject('water', new Point(5, 8)));

    this.sendAllComponents(this.entityFactory.addObject('sign', new Point(23, 85)));

    const signEntityId = this.entityFactory.getLastInsertedEntityId();
    const signEntity = this.serverEntities.getEntity(signEntityId);
    this.serverEntities.addIdentifier('sign_post', signEntity);

    this.sendAllComponents(this.entityFactory.addItem('empty_bottle', 2, new Point(27, 94)));
    this.sendAllComponents(this.entityFactory.addItem('empty_bottle', 1, new Point(31, 95)));

    this.sendAllComponents(this.entityFactory.addItem('knife', 1, new Point(17, 93)));
    this.sendAllComponents(this.entityFactory.addItem('knife', 1, new Point(26, 90)));

    const startBuildingData: BuildingData = [
      [{outer: 'outer_rtl', inner: 'floor_wtl'}, {outer: 'outer_rt', inner: 'floor_wt'}, {outer: 'outer_rtr', inner: 'floor_wtr'}],
      [{outer: 'outer_rbl', inner: 'floor_wl'}, {outer: 'outer_rb', inner: 'floor'}, {outer: 'outer_rbr', inner: 'floor_wr'}],
      [{outer: 'outer_wbl', inner: 'floor_wbl'}, {outer: 'outer_db', inner: 'floor_db'}, {outer: 'outer_wbr', inner: 'floor_wbr'}]
    ];
    this.sendAllComponents(this.entityFactory.addBuilding2(startBuildingData, new Point(82, 85)));

    this.testProjectile();
  }

  private testProjectile() {
    const e = this.entityFactory.createEntity();
    const start = new Point(20, 95);
    const projectileComp = this.entityFactory.addProjectileComponent(e, start);
    const proj = projectileComp[0] as ProjectileComponent;
    proj.targetPoint = { x: 42, y: 73 };
    this.sendAllComponents(projectileComp);
  }
}
