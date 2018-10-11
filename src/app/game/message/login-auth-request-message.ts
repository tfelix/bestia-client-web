import { IMessage } from './Message';

export interface LoginAuthRequestMessage extends IMessage {
  token: string;
}
