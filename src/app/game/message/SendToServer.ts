import { EngineEvents } from './EngineEvents';

export function sendToServer(msg: any) {
  PubSub.publish(EngineEvents.IO_SEND_MSG, msg);
}
