
import {
  Entity, ComponentType, VegetationComponent, PositionComponent
} from 'app/game/entities';

import { ComponentRenderer } from './ComponentRenderer';
import { EngineContext } from '../../EngineContext';
import { MapHelper } from '../../MapHelper';

export interface VegetationData {
  tiles: Phaser.GameObjects.Image[];
}
export class VegetationComponentRenderer extends ComponentRenderer<VegetationComponent> {

  constructor(
    ctx: EngineContext
  ) {
    super(ctx.gameScene);

  }

  get supportedComponent(): ComponentType {
    return ComponentType.VEGETATION;
  }

  protected hasNotSetup(entity: Entity, component: VegetationComponent): boolean {
    return !entity.data.vegetation;
  }

  protected createGameData(entity: Entity, component: VegetationComponent) {
    const bbox = this.findBoundingBox(component);
    const pos = entity.getComponent(ComponentType.POSITION) as PositionComponent;
    const pxOffset = MapHelper.pointToPixel(pos.position);

    const images = [];

    component.hullPoints.forEach(p => {
      const px = MapHelper.pointToPixel(p);
      const img = this.game.add.image(px.x + pxOffset.x, px.y + pxOffset.y, 'vegetation', 'grass_1_br.png');
      img.setOrigin(0, 0);
      images.push(img);
    });

    for (let x = 0; x < bbox.width; x++) {
      for (let y = 0; y < bbox.height; y++) {
        // Render the tiles.
      }
    }
  }

  private findBoundingBox(component: VegetationComponent): Phaser.Geom.Rectangle {
    let xMin = 0, yMin = 0, xMax = 0, yMax = 0;
    component.hullPoints.forEach(p => {
      if (p.x < xMin) {
        xMin = p.x;
      }
      if (p.x > xMax) {
        xMax = p.x;
      }
      if (p.y < yMax) {
        yMin = p.y;
      }
      if (p.y > yMax) {
        yMax = p.y;
      }
    });

    return new Phaser.Geom.Rectangle(xMin, yMin, xMax - xMin, yMax - yMin);
  }

  protected updateGameData(entity: Entity, component: VegetationComponent) {

  }
}
