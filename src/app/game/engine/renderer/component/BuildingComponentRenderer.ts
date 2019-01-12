import * as LOG from 'loglevel';
import { Entity, BuildingComponent, ComponentType, PositionComponent, ConnectedBuildingComponentFinder } from 'app/game/entities';

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
  windows: Array<{ name: string, position: Vec2 }>;
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

  private readonly connectedBuildingFinder: ConnectedBuildingComponentFinder;
  private currentEnteredBuildingEntityIds = new Set<number>();

  constructor(
    private ctx: EngineContext
  ) {
    super(ctx.gameScene);

    this.connectedBuildingFinder = new ConnectedBuildingComponentFinder(this.ctx.entityStore);
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
    const enteredBuilding = this.getEnteredBuildingEntity();

    const isAlreadyInThisBuilding = enteredBuilding && this.currentEnteredBuildingEntityIds.has(enteredBuilding.id);
    const wasInBuilding = enteredBuilding === null && this.currentEnteredBuildingEntityIds.size !== 0;

    if (wasInBuilding) {
      this.showBuildingRoof();
    }

    if (!isAlreadyInThisBuilding) {
      this.hideBuildingRoof(enteredBuilding);
    }
  }

  private showBuildingRoof() {
    const roofEntityIds = Array.from(this.currentEnteredBuildingEntityIds);
    this.animateRoofAlpha(1, roofEntityIds);
    this.currentEnteredBuildingEntityIds.clear();
  }

  private hideBuildingRoof(building: Entity | null) {
    if (building == null) {
      return;
    }

    // We are already inside this building. Nothing needs to be done.
    if (this.currentEnteredBuildingEntityIds.has(building.id)) {
      return;
    }

    const buildingComp = building.getComponent(ComponentType.BUILDING) as BuildingComponent;
    const allBuilding = this.connectedBuildingFinder.findAllConnectedEntityIds(buildingComp);
    this.animateRoofAlpha(0, allBuilding);
  }

  private animateRoofAlpha(targetAlpha: number, buildingEntityIds: number[]) {
    const roofSprites = buildingEntityIds.map(eid => {
      this.currentEnteredBuildingEntityIds.add(eid);
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

  private getEnteredBuildingEntity(): Entity | null {
    const player = this.ctx.playerHolder.activeEntity;
    const allBuildingEntities = this.ctx.entityStore.getAllEntitiesWithComponents(
      ComponentType.BUILDING,
      ComponentType.POSITION
    );

    for (const buildingEntity of allBuildingEntities) {
      if (this.ctx.collisionChecker.collides(player, buildingEntity)) {
        return buildingEntity;
      }
    }

    return null;
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
