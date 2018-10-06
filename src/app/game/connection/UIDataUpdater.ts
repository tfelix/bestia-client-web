import { UiModalMessage } from 'app/game/message';
import { EngineContext } from 'app/game/engine';
import { Topics } from './Topics';

export class UIDataUpdater {
  constructor(
    private readonly ctx: EngineContext
  ) {
    PubSub.subscribe(Topics.IO_RECV_UI_MSG, (_, msg) => this.onUIUpdateMessage(msg));
  }

  private onUIUpdateMessage(msg: UiModalMessage) {
    this.ctx.data.uiModal.push(msg.text);
  }
}
