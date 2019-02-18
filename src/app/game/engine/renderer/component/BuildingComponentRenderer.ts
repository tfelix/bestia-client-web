import * as LOG from 'loglevel';
import { Entity, BuildingComponent, ComponentType, PositionComponent } from 'app/game/entities';

import { EngineContext } from '../../EngineContext';
import { ComponentRenderer } from './ComponentRenderer';
import { MapHelper } from '../../MapHelper';
import { Vec2 } from 'app/game/model';

export interface BuildingDescription {
  name: string;
  type: string;
  version: number;
  blockSize: number;
  doors: Array<{ name: string, position: Vec2 }>;
  windows: Array<{ name: string, position: Vec2, isVertical: boolean }>;
}

export interface BuildingData {
  innerSprite: Phaser.GameObjects.Image;
  outerSprite: Phaser.GameObjects.Image | null;
}

interface CorrectedSpriteName {
  flipX: boolean;
  correctedSpriteName: string;
}

export class BuildingComponentRenderer extends ComponentRenderer<BuildingComponent> {

  private hiddenBuildingRoofEntityIds = new Set<number>();

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

  private getSpriteNameMeta(spriteName: string): CorrectedSpriteName {
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

    const buildingData: BuildingData = {
      innerSprite: this.createBuildingInner(mapPos, component),
      outerSprite: null
    };

    if (component.outerSprite) {
      buildingData.outerSprite = this.createBuildingOuter(mapPos, component);
    }

    entity.data.building = buildingData;
  }

  private createBuildingInner(mapPos: Vec2, component: BuildingComponent): Phaser.GameObjects.Image {
    const spriteMetaInner = this.getSpriteNameMeta(component.innerSprite);
    const innerBuilding = this.ctx.gameScene.add.image(mapPos.x, mapPos.y, component.spriteSheet, spriteMetaInner.correctedSpriteName);
    innerBuilding.setOrigin(0);
    innerBuilding.flipX = spriteMetaInner.flipX;

    return innerBuilding;
  }

  private createBuildingOuter(mapPos: Vec2, component: BuildingComponent): Phaser.GameObjects.Image {
    const spriteMetaOuter = this.getSpriteNameMeta(component.outerSprite);
    const outerSprite = this.ctx.gameScene.add.image(
      mapPos.x,
      mapPos.y,
      component.spriteSheet,
      spriteMetaOuter.correctedSpriteName
    );
    outerSprite.setOrigin(0);
    outerSprite.flipX = spriteMetaOuter.flipX;
    outerSprite.depth = mapPos.y;

    return outerSprite;
  }

  protected updateGameData(entity: Entity, component: BuildingComponent) {
    const inBuilding = this.ctx.collision.building.isInsideBuilding();

    if (inBuilding) {
      this.hideBuildingRoof();
    } else {
      this.showBuildingRoof();
    }
  }

  private showBuildingRoof() {
    const roofEntityIds = Array.from(this.hiddenBuildingRoofEntityIds);
    this.animateRoofAlpha(1, roofEntityIds);
    this.hiddenBuildingRoofEntityIds.clear();
  }

  private hideBuildingRoof() {
    // TODO Maybe this handling is too cumbersome. Think about introducing a Building class which
    // contains multiple entitys and form a complex building structure to work with.
    const buildingEntityIds = this.ctx.collision.building.getCurrentOccupiedBuildingEntityIds();
    if (buildingEntityIds == null) {
      return;
    }

    this.animateRoofAlpha(0, buildingEntityIds);
    buildingEntityIds.forEach(id => this.hiddenBuildingRoofEntityIds.add(id));
  }

  private animateRoofAlpha(targetAlpha: number, buildingEntityIds: number[]) {
    const roofSprites = buildingEntityIds.map(eid => {
      const e = this.ctx.entityStore.getEntity(eid);
      const buildingData = e.data.building;
      return buildingData && buildingData.outerSprite;
    }).filter(x => !!x);

    this.ctx.gameScene.tweens.add({
      targets: roofSprites,
      alpha: targetAlpha,
      ease: 'Power3',
      duration: 600
    });
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
