import { ActionType } from './ActionType';

export class Action {
  constructor(
    public readonly actionType: ActionType
  ) {
  }
}
