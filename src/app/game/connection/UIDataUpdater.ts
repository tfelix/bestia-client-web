import { UiModalMessage, EngineEvents } from 'app/game/message';
import { EngineContext } from 'app/game/engine';

export class UiDataUpdater {
  constructor(
    private readonly ctx: EngineContext
  ) {
    PubSub.subscribe(EngineEvents.IO_RECV_UI_MSG, (_, msg) => this.onUIUpdateMessage(msg));
  }

  private onUIUpdateMessage(msg: UiModalMessage) {
    this.ctx.data.uiModal.push(msg.text);
  }
}
