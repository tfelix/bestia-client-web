
import {
  Entity, ComponentType, VegetationComponent, PositionComponent
} from 'app/game/entities';

import { ComponentRenderer } from './ComponentRenderer';
import { EngineContext } from '../../EngineContext';
import { MapHelper } from '../../MapHelper';
import { Vec2 } from 'app/game/model';

export interface VegetationData {
  tiles: Phaser.GameObjects.Image[];
}

function getHullPointsWithX(points: Vec2[], x: number) {
  return points.filter(p => p.x === x);
}

function compareY(a: Vec2, b: Vec2) {
  return a.y - b.y;
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

    const hull = component.hullPoints.slice(0);
    const borderSet = new Set<number>();

    for (let x = 0; x <= bbox.width; x++) {
      const currentPoints = getHullPointsWithX(hull, x).sort(compareY);

      if (currentPoints.length === 0) {
        continue;
      }

      const minY = currentPoints[0].y;
      const maxY = currentPoints[currentPoints.length - 1].y;

      for (let y = minY; y <= maxY; y++) {
        const isBorderTop = y === minY;
        const isBorderBottom = y === maxY;
        const isInside = minY < y && maxY > y;
        const isBorderLeft = !borderSet.has(y);
        const isBorderRight = borderSet.has(y);

        if (isBorderLeft) {
          borderSet.add(y);
        }

        if (isBorderRight) {
          borderSet.delete(y);
        }

        const px = MapHelper.xyPointToPx(x, y);

        if (isBorderLeft && isBorderTop) {
          const img = this.game.add.image(px.x + pxOffset.x, px.y + pxOffset.y, 'vegetation', 'grass_1_tl.png');
          img.setOrigin(0, 0);
          images.push(img);
        }

        if (isBorderLeft && isBorderBottom) {
          const img = this.game.add.image(px.x + pxOffset.x, px.y + pxOffset.y, 'vegetation', 'grass_1_bl.png');
          img.setOrigin(0, 0);
          images.push(img);
        }

        if (isBorderLeft && isInside) {
          const img = this.game.add.image(px.x + pxOffset.x, px.y + pxOffset.y, 'vegetation', 'grass_1_l.png');
          img.setOrigin(0, 0);
          images.push(img);
        }

        if (isBorderTop && isInside) {
          const img = this.game.add.image(px.x + pxOffset.x, px.y + pxOffset.y, 'vegetation', 'grass_1_t.png');
          img.setOrigin(0, 0);
          images.push(img);
        }

        if (!isBorderLeft && !isBorderTop && isInside) {
          const img = this.game.add.image(px.x + pxOffset.x, px.y + pxOffset.y, 'vegetation', 'grass_1.png');
          img.setOrigin(0, 0);
          images.push(img);
        }

        if (isBorderBottom && isInside) {
          const img = this.game.add.image(px.x + pxOffset.x, px.y + pxOffset.y, 'vegetation', 'grass_1_b.png');
          img.setOrigin(0, 0);
          images.push(img);
        }

        if (isBorderRight && isBorderTop) {
          const px = MapHelper.xyPointToPx(x, y);
          const img = this.game.add.image(px.x + pxOffset.x, px.y + pxOffset.y, 'vegetation', 'grass_1_tr.png');
          img.setOrigin(0, 0);
          images.push(img);
        }

        if (isBorderRight && isInside) {
          const px = MapHelper.xyPointToPx(x, y);
          const img = this.game.add.image(px.x + pxOffset.x, px.y + pxOffset.y, 'vegetation', 'grass_1_r.png');
          img.setOrigin(0, 0);
          images.push(img);
        }

        if (isBorderRight && isBorderBottom) {
          const px = MapHelper.xyPointToPx(x, y);
          const img = this.game.add.image(px.x + pxOffset.x, px.y + pxOffset.y, 'vegetation', 'grass_1_br.png');
          img.setOrigin(0, 0);
          images.push(img);
        }
      }
    }

    // Temp
    entity.data.vegetation = {
      tiles: []
    };
  }

  private addVegetationTile(posPx: Vec2, vegetationName: string, suffix: string): Phaser.GameObjects.Image {
    const img = this.game.add.image(posPx.x, posPx.y, 'vegetation', `${vegetationName}_${suffix}.png`);
    img.setOrigin(0, 0);

    return img;
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
