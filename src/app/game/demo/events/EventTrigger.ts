import { EngineEvents } from 'app/game/message';

export abstract class EventTrigger {

  abstract triggers();

  abstract getTriggerName(): string;

  protected sendClient(msg: any) {
    PubSub.publish(EngineEvents.IO_RECV_MSG, msg);
  }
}
