import { UiModalMessage, EngineEvents } from '../message';

export abstract class EventTrigger {

  abstract triggers();

  abstract getTriggerName(): string;

  protected sendClient(msg: any) {
    PubSub.publish(EngineEvents.IO_RECV_MSG, msg);
  }
}

export class HelloWorldTrigger extends EventTrigger {

  getTriggerName(): string {
    return 'helloWorld';
  }

  triggers() {
    const msg = new UiModalMessage(0, 'Hello Darkness my old friend!');
    this.sendClient(msg);
  }
}
