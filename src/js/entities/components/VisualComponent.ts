import { Component } from './Component';
import { ComponentType } from './ComponentType';
import { Point } from 'model';

export enum SpriteType {
  MULTI,
  SIMPLE,
  ITEM
}

export class VisualComponent extends Component {

  constructor(
    id: number,
    entityId: number,
    public visible: boolean,
    public sprite: string,
    public spriteType: SpriteType,
    public animation: string | null = null,
    public sightDirection: Point | null = null,
    /**
     * Other systems can set this. Such animations are only
     * shortly displayed and once after the normal animation is
     * played again.
     */
    public oneshotAnimation: string | null = null,
  ) {
    super(id, entityId, ComponentType.VISUAL);
  }
}
