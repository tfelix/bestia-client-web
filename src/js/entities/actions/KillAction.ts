import { Action } from './Action';
import { ActionType } from './ActionType';

export class KillAction extends Action {
  constructor() {
    super(ActionType.KILL);
  }
}
