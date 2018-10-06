import { Component } from 'app/game/entities';

export class ComponentMessage<T extends Component> {
  constructor(
    public readonly component: T
  ) {
  }
}
