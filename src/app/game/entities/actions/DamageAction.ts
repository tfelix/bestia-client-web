import { ActionType } from './ActionType';
import { Action } from './Action';

export enum DamageType {
  HEAL,
  CRITICAL,
  NORMAL
}

export class DamageAction extends Action {

  public readonly amounts: number[];

  constructor(
    amounts: number | number[],
    public readonly type: DamageType = DamageType.NORMAL
  ) {
    super(ActionType.DAMAGE);
    this.amounts = (Array.isArray(amounts)) ? amounts : [amounts];
  }

  get totalAmount(): number {
    let total = 0;
    this.amounts.forEach(v => total += v);
    return total;
  }
}
