import { ClientMessageHandler } from './ClientMessageHandler';
import { SyncRequestMessage, AccountInfoMessage, ComponentMessage } from 'message';
import { MoveComponent } from 'entities/components';
import { Point } from 'model';
import { EntityStore } from 'entities';
import { EntityLocalFactory } from './EntityLocalFactory';
import { UiModalMessage } from 'message/UiMessages';

export class RequestSyncHandler extends ClientMessageHandler<SyncRequestMessage> {

  private entityFactory = new EntityLocalFactory(this.serverEntities);

  constructor(
    private readonly serverEntities: EntityStore,
    private readonly playerAccId: number,
    private readonly playerEntityId: number
  ) {
    super();
  }

  public isHandlingMessage(msg: any): boolean {
    return msg instanceof SyncRequestMessage;
  }

  public handle(msg: SyncRequestMessage) {
    const accInfoMsg = new AccountInfoMessage('roggy', this.playerAccId, 'master');
    this.sendClient(accInfoMsg);

    const comps = this.entityFactory.addPlayer('player_1', new Point(2, 3), this.playerAccId);
    this.sendAllComponents(comps);

    // TODO Handle AI differently
    const bestiaComps = this.entityFactory.addBestia('rabbit', new Point(5, 6));
    const entityId = bestiaComps[0].entityId;
    window.setTimeout(() => {
      const moveComp = new MoveComponent(23456, entityId);
      moveComp.path = [
        new Point(4, 7),
        new Point(4, 8),
        new Point(4, 9),
        new Point(3, 9),
        new Point(2, 9),
        new Point(3, 8),
        new Point(4, 7)
      ];
      this.sendClient(new ComponentMessage<MoveComponent>(moveComp));
    }, 2000);
    this.sendAllComponents(bestiaComps);
    this.sendAllComponents(this.entityFactory.addBestia('rabbit', new Point(12, 12)));

    this.sendAllComponents(this.entityFactory.addObject('tree', new Point(10, 10)));
    this.sendAllComponents(this.entityFactory.addObject('tree', new Point(14, 12)));
    this.sendAllComponents(this.entityFactory.addObject('tree', new Point(18, 9)));
    this.sendAllComponents(this.entityFactory.addObject('tree', new Point(6, 16)));

    this.sendAllComponents(this.entityFactory.addObject('plant', new Point(3, 4)));
    this.sendAllComponents(this.entityFactory.addObject('plant', new Point(10, 8)));
    this.sendAllComponents(this.entityFactory.addObject('plant', new Point(7, 8)));

    this.sendAllComponents(this.entityFactory.addObject('water', new Point(5, 8)));

    this.sendAllComponents(this.entityFactory.addObject('sign', new Point(2, 8)));

    this.sendAllComponents(this.entityFactory.addItem('empty_bottle', 2, new Point(3, 12)));
    this.sendAllComponents(this.entityFactory.addItem('empty_bottle', 1, new Point(7, 18)));

    this.sendAllComponents(this.entityFactory.addItem('knife', 1, new Point(12, 10)));
    this.sendAllComponents(this.entityFactory.addItem('knife', 1, new Point(3, 6)));

    // DEV
    window.setTimeout(() => {
      const modalMsg = new UiModalMessage(this.playerEntityId, 'Hello World after 5 seconds.');
      this.sendClient(modalMsg);
    }, 5000);
  }
}
