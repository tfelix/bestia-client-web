import { Component } from 'entities/components';

export class ComponentMessage<T extends Component> {
  constructor(
    public readonly component: T
  ) {
  }
}
