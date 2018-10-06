import { ComponentType } from 'entities/components';

export class ComponentDeleteMessage {
  constructor(
    public readonly entityId: number,
    public readonly componentType: ComponentType
  ) {
  }
}
