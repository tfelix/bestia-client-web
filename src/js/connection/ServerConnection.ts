import { Message } from 'message/Message';

export interface ServerConnection {

   sendMessage(msg: Message<any>);
}

export class ServerLocalFacade implements ServerConnection {
  
  sendMessage(msg: Message<any>) {
    throw new Error("Method not implemented.");
  }

}
