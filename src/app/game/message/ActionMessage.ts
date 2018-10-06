import { Action } from 'entities';

export class ActionMessage<T extends Action> {
  constructor(
    readonly entityId: number,
    readonly payload: T
  ) {
  }
}
