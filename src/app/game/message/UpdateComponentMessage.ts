import { Component } from 'app/game/entities';

/**
 * This message is send to the server in order to update components
 * set on the client.
 */
export class UpdateComponentMessage<T extends Component> {
  constructor(
    public readonly component: T
  ) {
  }
}
