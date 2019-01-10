import * as LOG from 'loglevel';
import { Entity, BuildingComponent, ComponentType, PositionComponent } from 'app/game/entities';

import { EngineContext } from '../../EngineContext';
import { ComponentRenderer } from './ComponentRenderer';
import { MapHelper } from '../../MapHelper';

export interface BuildingData {
  innerSprite: Phaser.GameObjects.Image;
  outerSprite: Phaser.GameObjects.Image | null;
}

interface SpriteNameMeta {
  flipX: boolean;
  correctedSpriteName: string;
}

export class BuildingComponentRenderer extends ComponentRenderer<BuildingComponent> {

  constructor(
    private ctx: EngineContext
  ) {
    super(ctx.gameScene);
  }

  get supportedComponent(): ComponentType {
    return ComponentType.BUILDING;
  }

  protected hasNotSetup(entity: Entity, component: BuildingComponent): boolean {
    return !entity.data.building;
  }

  private getSpriteNameMeta(spriteName: string): SpriteNameMeta {
    let correctedName = '';
    if (spriteName.endsWith('.png')) {
      correctedName = spriteName;
    } else {
      correctedName = spriteName + '.png';
    }

    const flipX = correctedName.indexOf('_rtr') !== -1 ||
      correctedName.indexOf('_rr') !== -1 ||
      correctedName.indexOf('_rbr') !== -1 ||
      correctedName.indexOf('_wtr') !== -1 ||
      correctedName.indexOf('_wr') !== -1 ||
      correctedName.indexOf('_wbr') !== -1;
    if (flipX) {
      correctedName = correctedName.replace('_rtr', '_rtl');
      correctedName = correctedName.replace('_rr', '_rl');
      correctedName = correctedName.replace('_rbr', '_rbl');
      correctedName = correctedName.replace('_wbr', '_wbl');
      correctedName = correctedName.replace('_wr', '_wl');
      correctedName = correctedName.replace('_wtr', '_wtl');
    }

    return {
      correctedSpriteName: correctedName,
      flipX: flipX
    };
  }

  protected createGameData(entity: Entity, component: BuildingComponent) {
    const pos = entity.getComponent(ComponentType.POSITION) as PositionComponent;
    if (!pos) {
      LOG.warn(`Entity ${entity.id} has BuildingComponent but no PositionComponent. Can not render.`);
      return;
    }

    const mapPos = MapHelper.pointToPixel(pos.position);
    const spriteMetaInner = this.getSpriteNameMeta(component.innerSprite);
    const buildingData: BuildingData = {
      innerSprite: this.ctx.gameScene.add.image(mapPos.x, mapPos.y, component.spriteSheet, spriteMetaInner.correctedSpriteName),
      outerSprite: null
    };
    buildingData.innerSprite.setOrigin(0);
    buildingData.innerSprite.flipX = spriteMetaInner.flipX;

    if (component.outerSprite) {
      const spriteMetaOuter = this.getSpriteNameMeta(component.outerSprite);
      buildingData.outerSprite = this.ctx.gameScene.add.image(
        mapPos.x,
        mapPos.y,
        component.spriteSheet,
        spriteMetaOuter.correctedSpriteName
      );
      buildingData.outerSprite.setOrigin(0);
      buildingData.outerSprite.flipX = spriteMetaOuter.flipX;
    }

    entity.data.building = buildingData;
  }

  protected updateGameData(entity: Entity, component: BuildingComponent) {
    // Check if we are inside a building and if so, make all the upper entities
    // transparent.
  }

  public removeGameData(entity: Entity) {
    const buildingData = entity.data.building;
    if (!buildingData) {
      return;
    }

    buildingData.innerSprite.destroy();

    if (buildingData.outerSprite) {
      buildingData.outerSprite.destroy();
    }

    delete entity.data.building;
  }
}
