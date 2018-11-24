import { Component } from './Component';
import { ComponentType } from './ComponentType';

export class ProjectileComponent extends Component {

  public targetEntityId?: number;
  public targetPoint?: { x: number, y: number };
  public speed: number; // meter/s
  public hitEffect?: string;
  public projectileName: string;

  constructor(
    id: number,
    entityId: number
  ) {
    super(id, entityId, ComponentType.PROJECTILE);
  }
}
