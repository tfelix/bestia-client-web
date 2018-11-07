import { Topics } from 'app/game/connection';

export function sendToServer(msg: any) {
  PubSub.publish(Topics.IO_SEND_MSG, msg);
}
