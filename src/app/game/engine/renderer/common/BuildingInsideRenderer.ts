import { CommonRenderer } from './CommonRenderer';
import { EngineContext } from '../../EngineContext';
import { SceneNames } from '../../scenes/SceneNames';
import { ComponentType, BuildingComponent, PositionComponent } from 'app/game/entities';
import { BuildingDescription } from '../component/BuildingComponentRenderer';
import { MapHelper } from '../../MapHelper';
import { Px, Vec2 } from 'app/game/model';

interface WindowPos {
  x: number;
  y: number;
  isVertical: boolean;
}

function dist(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export class BuildingInsideRenderer extends CommonRenderer {

  private isInsideRenderActive = false;
  private outsideShadowOverlay: Phaser.GameObjects.Graphics;
  private outsideShadowRoomMask: Phaser.GameObjects.Graphics;
  private tempHelperLines: Phaser.GameObjects.Graphics;
  private uiUnderScene: Phaser.Scene;
  private lastRenderedPlayerPos = { x: 0, y: 0 };

  constructor(
    private readonly ctx: EngineContext
  ) {
    super();

    this.uiUnderScene = ctx.gameScene.game.scene.getScene(SceneNames.UI);
    this.outsideShadowOverlay = this.uiUnderScene.add.graphics({});
    this.outsideShadowRoomMask = this.uiUnderScene.make.graphics({});
    this.tempHelperLines = this.uiUnderScene.add.graphics({});
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

    // Prepare to draw the window see lines
    const playerSprite = this.ctx.playerHolder.activeEntity.data.visual.sprite;
    const playerLocalPx = MapHelper.worldPxToSceneLocal(this.ctx.gameScene.cameras.main, playerSprite.x, playerSprite.y);
    const playerLocal = new Phaser.Math.Vector2(playerLocalPx.x, playerLocalPx.y);
    this.lastRenderedPlayerPos.x = playerLocalPx.x;
    this.lastRenderedPlayerPos.y = playerLocalPx.y;

    const playerDistTopLeft = dist(playerLocalPx, { x: 0, y: 0 });
    const playerDistTopRight = dist(playerLocalPx, { x: this.ctx.helper.display.sceneWidth, y: 0 });
    const playerDistBottomLeft = dist(playerLocalPx, { x: 0, y: this.ctx.helper.display.sceneHeight });
    const playerDistBottomRight = dist(playerLocalPx, { x: this.ctx.helper.display.sceneWidth, y: this.ctx.helper.display.sceneHeight });
    const maxCornerDist = Math.max(playerDistBottomLeft, playerDistBottomRight, playerDistTopLeft, playerDistTopRight);

    this.outsideShadowOverlay.fillStyle(0x000000);
    this.outsideShadowOverlay.fillRect(0, 0, this.ctx.helper.display.sceneWidth, this.ctx.helper.display.sceneHeight);
    // this.outsideShadowRoomMask.fillStyle(0xFFFFFF, 1);
    // this.outsideShadowRoomMask.fillRect(0, 0, 2000, 2000);
    // this.outsideShadowRoomMask.fillStyle(0xFFFFFF, 0);

    // Gets position of the player
    // Draw depending from the player lines towards the windows
    const buildingEntityIds = this.ctx.collision.building.getCurrentOccupiedBuildingEntityIds();
    const windowWorldPos: WindowPos[] = [];

    // Draw the mask and find the windows
    buildingEntityIds.forEach(eid => {
      const buildingEntity = this.ctx.entityStore.getEntity(eid);
      const buildingComp = buildingEntity.getComponent(ComponentType.BUILDING) as BuildingComponent;
      const posComp = buildingEntity.getComponent(ComponentType.POSITION) as PositionComponent;
      const buildingDesc = this.ctx.gameScene.cache.json.get(buildingComp.jsonDescriptionName) as BuildingDescription;
      const buildingPxSize = buildingDesc.blockSize * MapHelper.TILE_SIZE_PX;

      const buildingWorldPos = MapHelper.pointToPixel(posComp.position);
      const buildingSceneLocalPos = MapHelper.worldPxToSceneLocal(this.ctx.gameScene.cameras.main, buildingWorldPos.x, buildingWorldPos.y);
      this.outsideShadowRoomMask.fillRect(buildingSceneLocalPos.x, buildingSceneLocalPos.y, buildingPxSize, buildingPxSize);

      this.extractWindowPosition(buildingDesc, posComp, buildingComp)
        .forEach(wpos => windowWorldPos.push(wpos));
    });

    this.outsideShadowOverlay.mask = this.outsideShadowRoomMask.createGeometryMask();
    // Currently this is not in the type.d file included. It will get included as soon as
    // https://github.com/photonstorm/phaser/pull/4301 will get merged.
    (this.outsideShadowOverlay.mask as any).invertAlpha = true;

    // Bring the windows into local space and then we need to sort them into a clockwise order (which is previously not guranteed)
    // in order to draw the sight effects.
    const winLocalPos = windowWorldPos.map(win => {
      const posGlobal = MapHelper.pointToPixel(win);
      const posLocal = MapHelper.worldPxToSceneLocal(this.ctx.gameScene.cameras.main, posGlobal.x, posGlobal.y);
      win.x = posLocal.x;
      win.y = posLocal.y;

      return win;
    });

    let i = 0;
    this.tempHelperLines.clear();
    this.sortClockwise(winLocalPos, playerLocal).forEach(win => {
      switch (i) {
        case 0:
          this.tempHelperLines.fillStyle(0xFF0000);
          break;
        case 1:
          this.tempHelperLines.fillStyle(0x00FF00);
          break;
        case 2:
          this.tempHelperLines.fillStyle(0x0000FF);
          break;
        case 3:
          this.tempHelperLines.fillStyle(0xFFFF00);
          break;
          case 4:
          this.tempHelperLines.fillStyle(0x00FFFF);
          break;
      }
      i++;

      if (win.isVertical) {
        this.tempHelperLines.fillRect(win.x, win.y, 5, MapHelper.TILE_SIZE_PX);

        // Draw test line
        this.tempHelperLines.lineBetween(playerLocalPx.x, playerLocalPx.y, win.x, win.y);
        this.tempHelperLines.lineBetween(playerLocalPx.x, playerLocalPx.y, win.x, win.y + MapHelper.TILE_SIZE_PX);

      } else {
        this.tempHelperLines.fillRect(win.x, win.y, MapHelper.TILE_SIZE_PX, 5);
        // Draw test line
        this.tempHelperLines.lineBetween(playerLocalPx.x, playerLocalPx.y, win.x, win.y);
        this.tempHelperLines.lineBetween(playerLocalPx.x, playerLocalPx.y, win.x + MapHelper.TILE_SIZE_PX, win.y);
      }
    });
  }

  private sortClockwise(wins: WindowPos[], playerLocalPos: Phaser.Math.Vector2): WindowPos[] {
    // Maybe use Phaser.Vec2 throughout the entire calculation.
    const sorted = wins.sort((a, b) => {
      const vA = new Phaser.Math.Vector2(a.x - playerLocalPos.x, a.y - playerLocalPos.y);
      const vB = new Phaser.Math.Vector2(b.x - playerLocalPos.x, b.y - playerLocalPos.y);
      let angleA = vA.angle();
      let angleB = vB.angle();

      if (angleA < 0) {
        angleA = 2 * Math.PI + angleA;
      }
      if (angleB < 0) {
        angleB = 2 * Math.PI + angleB;
      }

      return angleA - angleB;
    });

    return sorted;
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

      const isRightWall = window.position.x === buildingDesc.blockSize - 1;
      const isBottomWall = window.position.y === buildingDesc.blockSize - 1;

      // Correct the wall position of the window in relation to the outside wall
      // If this correction for correct ligting needs to be calculated here already we must
      // put world position calculation in here.
      if (window.isVertical && isRightWall) {
        winX += 1;
      }

      if (window.isVertical && isBottomWall) {
        winY += 1;
      }

      return { x: winX, y: winY, isVertical: window.isVertical };
    });
  }

  private removeBuildingInside() {
    this.isInsideRenderActive = false;
    this.outsideShadowOverlay.alpha = 0;
    this.ctx.gameScene.cameras.main.renderToTexture = true;
    this.tempHelperLines.clear();
  }
}
