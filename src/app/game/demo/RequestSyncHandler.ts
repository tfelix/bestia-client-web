import { SyncRequestMessage, AccountInfoMessage, ComponentMessage } from 'app/game/message';
import { MoveComponent, FxComponent, ProjectileComponent } from 'app/game/entities';
import { Point } from 'app/game/model';

import { EntityLocalFactory } from './EntityLocalFactory';
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

    // const comps = this.entityFactory.addPlayer('player_1', new Point(86, 94), this.playerAccId);
    const comps = this.entityFactory.addPlayer('player_1', new Point(20, 96), this.playerAccId);
    this.sendAllComponents(comps);

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

    // The creation of the server side entities should be done in a seperate component
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
