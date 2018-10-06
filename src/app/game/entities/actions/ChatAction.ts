import { Action } from './Action';
import { ActionType } from './ActionType';

export class ChatAction extends Action {
  constructor(
    public readonly text: string,
    public readonly nickname?: string
  ) {
    super(ActionType.CHAT);
  }
}
