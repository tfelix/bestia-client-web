import { UiModalMessage, EngineEvents } from 'app/game/message';
import { EventTrigger } from './EventTrigger';

export class HelloWorldTrigger extends EventTrigger {

  getTriggerName(): string {
    return 'hello_world';
  }

  triggers() {
    const msg = new UiModalMessage(0, 'Hello Darkness my old friend!');
    this.sendClient(msg);
  }
}
