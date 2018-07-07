import * as LOG from 'loglevel';
import { Action } from './actions/Action';
import { Component } from './components/Component';
import { ComponentType } from './components/ComponentType';
import { EntityData } from './EntityData';

export class Entity {
  private readonly components = new Map<ComponentType, Component>();

  public readonly data = new EntityData();
  public actions: Action[] = [];

  public latency = 0;

  public readonly removedComponentTypes: ComponentType[] = [];

  constructor(
    public readonly id: number,
  ) {
  }

  public hasAction(actionConstructor: { new(...args: any[]) }): boolean {
    return this.actions.findIndex(x => x instanceof actionConstructor) !== -1;
  }

  public getComponentIterator(): IterableIterator<Component> {
    return this.components.values();
  }

  public addComponent(component: Component) {
    LOG.debug(`Add component ${component.type} to entity ${this.id}`);
    this.components.set(component.type, component);
  }

  public getComponent(type: ComponentType) {
    return this.components.get(type);
  }

  public hasComponent(type: ComponentType): boolean {
    return this.components.has(type);
  }

  public removeComponentByType(type: ComponentType) {
    LOG.debug(`Remove component ${type} from entity ${this.id}`);
    this.components.delete(type);
    this.removedComponentTypes.push(type);
  }
}
