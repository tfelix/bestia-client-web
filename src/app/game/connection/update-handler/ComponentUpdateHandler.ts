import { ComponentType } from '../../entities/components/ComponentType';
import { ComponentMessage } from '../../message/ComponentMessage';
import { Component } from '../../entities/components/Component';
import { ComponentDeleteMessage } from '../../message/ComponentDeleteMessage';

/**
 * The ComponentUpdateHandler can be used to intercept or update component updates.
 */
export interface ComponentUpdaterHandler {
  updatesOnComponentType(): ComponentType[];

  onComponentMessage(msg: ComponentMessage<Component>);

  onComponentDeleteMessage(msg: ComponentDeleteMessage);
}
