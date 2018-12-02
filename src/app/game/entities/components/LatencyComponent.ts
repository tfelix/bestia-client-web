import { Component } from './Component';
import { ComponentType } from './ComponentType';

export class LatencyComponent extends Component {

  public latencyMs = 0;

  constructor(
    id: number,
    entityId: number
  ) {
    super(id, entityId, ComponentType.LATENCY);
  }
}
