import { UiModalMessage } from 'app/game/message';
import { EventTrigger } from './EventTrigger';

export class HelloWorldTrigger extends EventTrigger {

  getTriggerName(): string {
    return 'hello_world';
  }

  triggers() {
    const msg = new UiModalMessage('Hello Darkness my old friend!');
    this.sendClient(msg);
  }
}
