import { Action } from 'entities/actions';

export class ActionMessage<T extends Action> {
  constructor(
    readonly entityId: number,
    readonly payload: T
  ) {
  }
}
