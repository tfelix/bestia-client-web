import { Message } from 'message/Message';

export interface ServerConnection {

   sendMessage(msg: Message<any>);
}
