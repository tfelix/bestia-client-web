import { Action } from 'app/game/entities';

export class ActionMessage<T extends Action> {
  constructor(
    readonly entityId: number,
    readonly payload: T
  ) {
  }
}
