import { ComponentType } from 'app/game/entities';

export class ComponentDeleteMessage {
  constructor(
    public readonly entityId: number,
    public readonly componentType: ComponentType
  ) {
  }
}
