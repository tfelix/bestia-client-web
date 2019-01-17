import { ComponentType } from '../entities/components/ComponentType';
import { ComponentMessage } from '../message/ComponentMessage';
import { Component } from '../entities/components/Component';
import { ComponentDeleteMessage } from '../message/ComponentDeleteMessage';

export interface ComponentUpdaterHandler {
  updatesOnComponentType(): ComponentType[];

  onComponentMessage(msg: ComponentMessage<Component>);

  onComponentDeleteMessage(msg: ComponentDeleteMessage);
}
