import * as LOG from 'loglevel';
import { UiModalMessage } from 'app/game/message';
import { EventTrigger } from './EventTrigger';


export class HelloWorldTrigger extends EventTrigger {

  getTriggerName(): string {
    return 'hello_world';
  }

  triggers() {
    LOG.warn('Triggered');
    const msg = new UiModalMessage(0, 'Hello Darkness my old friend!');
    this.sendClient(msg);
  }
}
