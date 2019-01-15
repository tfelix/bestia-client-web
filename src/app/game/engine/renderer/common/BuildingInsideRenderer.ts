import { CommonRenderer } from './CommonRenderer';
import { EngineContext } from '../../EngineContext';
import { SceneNames } from '../../scenes/SceneNames';
import { ComponentType, BuildingComponent, PositionComponent } from 'app/game/entities';
import { BuildingDescription } from '../component/BuildingComponentRenderer';
import { MapHelper } from '../../MapHelper';
import { Px } from 'app/game/model';

interface WindowPos {
  x: number;
  y: number;
  isVertical: boolean;
}

export class BuildingInsideRenderer extends CommonRenderer {

  private isInsideRenderActive = false;
  private outsideShadowOverlay: Phaser.GameObjects.Graphics;
  private outsideShadowRoomMask: Phaser.GameObjects.Graphics;
  private uiUnderScene: Phaser.Scene;
  private lastRenderedPlayerPos = { x: 0, y: 0 };

  constructor(
    private readonly ctx: EngineContext
  ) {
    super();

    this.uiUnderScene = ctx.gameScene.game.scene.getScene(SceneNames.UI);
    this.outsideShadowOverlay = this.uiUnderScene.add.graphics({});
    this.outsideShadowRoomMask = this.uiUnderScene.make.graphics({});
    this.outsideShadowRoomMask.fillStyle(0x000000);
  }

  public needsUpdate(): boolean {
    const isPlayerInBuilding = this.ctx.collision.building.isInsideBuilding();

    const playerPosComp = this.ctx.playerHolder.activeEntity.getComponent(ComponentType.POSITION) as PositionComponent;
    const hasPlayerMoved = this.lastRenderedPlayerPos.x !== playerPosComp.position.x
      || this.lastRenderedPlayerPos.y !== playerPosComp.position.y;

    return this.isInsideRenderActive !== isPlayerInBuilding || isPlayerInBuilding && hasPlayerMoved;
  }

  public update() {
    const isPlayerInBuilding = this.ctx.collision.building.isInsideBuilding();

    if (isPlayerInBuilding) {
      this.updateBuildingInside();
    } else {
      this.removeBuildingInside();
    }
  }

  private getWindowsOfBuilding() {

  }

  private updateBuildingInside() {
    this.isInsideRenderActive = true;
    this.ctx.gameScene.cameras.main.renderToTexture = false;
    this.outsideShadowOverlay.clear();
    this.outsideShadowRoomMask.clear();

    this.outsideShadowOverlay.fillStyle(0x000000, 1);
    // this.outsideShadowOverlay.fillRect(0, 0, 2000, 2000);

    // Gets position of the player
    // Draw depending from the player lines towards the windows
    const buildingEntityIds = this.ctx.collision.building.getCurrentOccupiedBuildingEntityIds();
    const windowWorldPos: WindowPos[] = [];

    // Draw the mask and find the windows
    this.outsideShadowRoomMask.beginPath();
    buildingEntityIds.forEach(eid => {
      const buildingEntity = this.ctx.entityStore.getEntity(eid);
      const buildingComp = buildingEntity.getComponent(ComponentType.BUILDING) as BuildingComponent;
      const posComp = buildingEntity.getComponent(ComponentType.POSITION) as PositionComponent;
      const buildingDesc = this.ctx.gameScene.cache.json.get(buildingComp.jsonDescriptionName) as BuildingDescription;
      const buildingPxSize = buildingDesc.blockSize * MapHelper.TILE_SIZE_PX;

      const buildingWorldPos = MapHelper.pointToPixel(posComp.position);
      const buildingSceneLocalPos = MapHelper.worldPxToSceneLocal(this.ctx.gameScene.cameras.main, buildingWorldPos.x, buildingWorldPos.y);

      // this.outsideShadowRoomMask.fillRect(buildingSceneLocalPos.x, buildingSceneLocalPos.y, buildingPxSize, buildingPxSize);

      this.extractWindowPosition(buildingDesc, posComp, buildingComp)
        .forEach(wpos => windowWorldPos.push(wpos));
    });
    // this.outsideShadowOverlay.mask = this.outsideShadowRoomMask.createGeometryMask();

    // draw the windows
    const playerPosComp = this.ctx.playerHolder.activeEntity.getComponent(ComponentType.POSITION) as PositionComponent;
    const playerPosWorld = MapHelper.pointToPixelCentered(playerPosComp.position);
    const playerLocalPx = MapHelper.worldPxToSceneLocal(this.ctx.gameScene.cameras.main, playerPosWorld.x, playerPosWorld.y);
    this.lastRenderedPlayerPos.x = playerPosComp.position.x;
    this.lastRenderedPlayerPos.y = playerPosComp.position.y;

    this.outsideShadowOverlay.fillStyle(0xFF0000);
    this.outsideShadowOverlay.lineStyle(1, 0x00FF00);
    windowWorldPos.forEach(win => {
      const posGlobal = MapHelper.pointToPixel(win);
      const posLocal = MapHelper.worldPxToSceneLocal(this.ctx.gameScene.cameras.main, posGlobal.x, posGlobal.y);

      if (win.isVertical) {
        this.outsideShadowOverlay.fillRect(posLocal.x, posLocal.y, MapHelper.TILE_SIZE_PX, 5);

        // Draw test line
        this.outsideShadowOverlay.lineBetween(playerLocalPx.x, playerLocalPx.y, posLocal.x, posLocal.y);
        this.outsideShadowOverlay.lineBetween(playerLocalPx.x, playerLocalPx.y, posLocal.x, posLocal.y + MapHelper.TILE_SIZE_PX);

      } else {
        this.outsideShadowOverlay.fillRect(posLocal.x, posLocal.y, 5, MapHelper.TILE_SIZE_PX);
        // Draw test line
        this.outsideShadowOverlay.lineBetween(playerLocalPx.x, playerLocalPx.y, posLocal.x, posLocal.y);
        this.outsideShadowOverlay.lineBetween(playerLocalPx.x, playerLocalPx.y, posLocal.x, posLocal.y + MapHelper.TILE_SIZE_PX);
      }
    });
  }

  private extractWindowPosition(
    buildingDesc: BuildingDescription,
    posComp: PositionComponent,
    buildingComp: BuildingComponent
  ): WindowPos[] {
    const windows = buildingDesc.windows.filter(x => x.name === buildingComp.innerSprite);

    return windows.map(window => {
      let winX = window.position.x + posComp.position.x;
      let winY = window.position.y + posComp.position.y;

      const isVertical = posComp.position.y === 0 || posComp.position.y === buildingDesc.blockSize - 1;
      const isRightWall = window.position.x === buildingDesc.blockSize - 1;
      const isBottomWall = window.position.y === buildingDesc.blockSize - 1;

      // Correct the wall position of the window in relation to the outside wall
      // If this correction for correct ligting needs to be calculated here already we must
      // put world position calculation in here.
      if (!isVertical && isRightWall) {
        winX += 1;
      }

      if (isVertical && isBottomWall) {
        winY += 1;
      }

      return { x: winX, y: winY, isVertical: isVertical };
    });
  }

  private removeBuildingInside() {
    this.isInsideRenderActive = false;
    this.outsideShadowOverlay.alpha = 0;
    this.ctx.gameScene.cameras.main.renderToTexture = true;
  }
}
