import { Vec2 } from 'app/game/model';
import { ComponentType, BuildingComponent, PositionComponent } from 'app/game/entities';

import { CommonRenderer } from './CommonRenderer';
import { EngineContext } from '../../EngineContext';
import { SceneNames } from '../../scenes/SceneNames';
import { BuildingDescription } from '../component/BuildingComponentRenderer';
import { MapHelper } from '../../MapHelper';

interface WindowPos {
  x: number;
  y: number;
  isVertical: boolean;
}

interface WindowPolar {
  a: Polar;
  b: Polar;
}

interface Polar {
  r: number;
  theta: number;
}

function dist(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function toPolar(x: number, y: number): Polar {
  const preTheta = Math.atan2(y, x)
  return {
    r: Math.sqrt(x * x + y * y),
    theta: (preTheta < 0) ? Math.PI * 2 - preTheta : preTheta
  };
}

export class BuildingInsideRenderer extends CommonRenderer {

  private isInsideRenderActive = false;

  private shadowMapGfx: Phaser.GameObjects.Graphics;
  private shadowMap: Phaser.GameObjects.RenderTexture;
  private outsideShadowOverlay: Phaser.GameObjects.Graphics;
  private tempHelperLines: Phaser.GameObjects.Graphics;
  private uiUnderScene: Phaser.Scene;
  private lastRenderedPlayerPos = { x: 0, y: 0 };
  private renderedBuildingEntityCount = 0;

  constructor(
    private readonly ctx: EngineContext
  ) {
    super();

    this.uiUnderScene = ctx.gameScene.game.scene.getScene(SceneNames.UI);
    this.outsideShadowOverlay = this.uiUnderScene.add.graphics({});

    // For testing
    this.tempHelperLines = this.uiUnderScene.add.graphics({});
  }

  public needsUpdate(): boolean {
    const isPlayerInBuilding = this.ctx.collision.building.isInsideBuilding();
    const player = this.ctx.playerHolder.activeEntity;

    if (!player) {
      return false;
    }

    const currentBuildingEntityCount = this.ctx.collision.building.getCurrentOccupiedBuildingEntityIds().length;
    const hasBuildingChanged = currentBuildingEntityCount !== this.renderedBuildingEntityCount;

    const playerSprite = player.data.visual.sprite;
    const hasPlayerMoved = this.lastRenderedPlayerPos.x !== playerSprite.x ||
      this.lastRenderedPlayerPos.y !== playerSprite.y;

    return this.isInsideRenderActive !== isPlayerInBuilding
      || isPlayerInBuilding && hasPlayerMoved
      || isPlayerInBuilding && hasBuildingChanged;
  }

  public create() {
    this.shadowMap = this.uiUnderScene.make.renderTexture({
      x: 0,
      y: 0,
      width: this.ctx.helper.display.sceneWidth,
      height: this.ctx.helper.display.sceneHeight
    });
    this.shadowMap.visible = false;

    this.shadowMapGfx = this.uiUnderScene.add.graphics({});
    this.shadowMapGfx.setVisible(false);
    this.shadowMapGfx.fillStyle(0x000000);

    this.outsideShadowOverlay = this.uiUnderScene.add.graphics();

    this.outsideShadowOverlay.mask = new Phaser.Display.Masks.BitmapMask(this.uiUnderScene, this.shadowMap);
    this.outsideShadowOverlay.mask.invertAlpha = true;
  }

  public update() {
    const isPlayerInBuilding = this.ctx.collision.building.isInsideBuilding();

    if (isPlayerInBuilding) {
      this.updateBuildingInside();
    } else {
      this.removeBuildingInside();
    }
  }

  private updateBuildingInside() {
    this.isInsideRenderActive = true;
    this.ctx.gameScene.cameras.main.renderToTexture = false;

    this.outsideShadowOverlay.fillStyle(0x000000);
    this.outsideShadowOverlay.fillRect(0, 0, this.ctx.helper.display.sceneWidth, this.ctx.helper.display.sceneHeight);

    // Prepare to draw the window see lines
    const player = this.ctx.playerHolder.activeEntity;
    const playerSprite = player.data.visual.sprite;
    const playerLocalPx = MapHelper.worldPxToSceneLocal(this.ctx.gameScene.cameras.main, playerSprite.x, playerSprite.y);
    const playerLocal = new Phaser.Math.Vector2(playerLocalPx.x, playerLocalPx.y);

    const playerPosComp = player.getComponent(ComponentType.POSITION) as PositionComponent;
    this.lastRenderedPlayerPos.x = playerSprite.x;
    this.lastRenderedPlayerPos.y = playerSprite.y;

    const playerDistTopLeft = dist(playerLocalPx, { x: 0, y: 0 });
    const playerDistTopRight = dist(playerLocalPx, { x: this.ctx.helper.display.sceneWidth, y: 0 });
    const playerDistBottomLeft = dist(playerLocalPx, { x: 0, y: this.ctx.helper.display.sceneHeight });
    const playerDistBottomRight = dist(playerLocalPx, { x: this.ctx.helper.display.sceneWidth, y: this.ctx.helper.display.sceneHeight });
    const maxCornerDist = Math.max(playerDistBottomLeft, playerDistBottomRight, playerDistTopLeft, playerDistTopRight);

    // Gets position of the player
    // Draw depending from the player lines towards the windows
    const buildingEntityIds = this.ctx.collision.building.getCurrentOccupiedBuildingEntityIds();
    this.renderedBuildingEntityCount = buildingEntityIds.length;
    const windowWorldPos: WindowPos[] = [];

    // Draw the mask and find the windows
    this.shadowMapGfx.clear();
    this.shadowMapGfx.fillStyle(0x000000, 1);
    this.shadowMap.clear();

    buildingEntityIds.forEach(eid => {
      const buildingEntity = this.ctx.entityStore.getEntity(eid);
      const buildingComp = buildingEntity.getComponent(ComponentType.BUILDING) as BuildingComponent;
      const posComp = buildingEntity.getComponent(ComponentType.POSITION) as PositionComponent;
      const buildingDesc = this.ctx.gameScene.cache.json.get(buildingComp.jsonDescriptionName) as BuildingDescription;
      const buildingPxSize = buildingDesc.blockSize * MapHelper.TILE_SIZE_PX;

      const buildingWorldPos = MapHelper.pointToPixel(posComp.position);
      const buildingSceneLocalPos = MapHelper.worldPxToSceneLocal(this.ctx.gameScene.cameras.main, buildingWorldPos.x, buildingWorldPos.y);
      this.shadowMapGfx.fillRect(buildingSceneLocalPos.x, buildingSceneLocalPos.y, buildingPxSize, buildingPxSize);

      this.extractWindowPosition(buildingDesc, posComp, buildingComp).forEach(wpos => windowWorldPos.push(wpos));
    });

    // Bring the windows into local space and then we need to sort them into a clockwise order (which is previously not guranteed)
    // in order to draw the sight beam effects.
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

        const rx = playerLocalPx.x - win.x;
        const ry = playerLocalPx.y - win.y;
        const y = playerLocalPx.y - playerLocalPx.x / rx * ry;

        this.shadowMapGfx.fillStyle(0x000000, 1);
        const a = new Phaser.Geom.Point(400, 100);
        const b = new Phaser.Geom.Point(200, 400);
        const c = new Phaser.Geom.Point(playerLocalPx.x, playerLocalPx.y);
        this.shadowMapGfx.fillTriangle(0, y, b.x, b.y, c.x, c.y);
      } else {
        this.tempHelperLines.fillRect(win.x, win.y, MapHelper.TILE_SIZE_PX, 5);
        // Draw test line
        this.tempHelperLines.lineBetween(playerLocalPx.x, playerLocalPx.y, win.x, win.y);
        this.tempHelperLines.lineBetween(playerLocalPx.x, playerLocalPx.y, win.x + MapHelper.TILE_SIZE_PX, win.y);
      }
    });

    // winLocalPos.map(x => toPolar(x.x, x.y));

    /*
    this.shadowMapGfx.fillStyle(0x000000, 1);
    var a = new Phaser.Geom.Point(400, 100);
    var b = new Phaser.Geom.Point(200, 400);
    var c = new Phaser.Geom.Point(playerLocalPx.x, playerLocalPx.y);
    this.shadowMapGfx.fillTriangle(a.x, a.y, b.x, b.y, c.x, c.y);

    this.shadowMapGfx.fillStyle(0x000000, 0.4);
    a = new Phaser.Geom.Point(400, 0);
    b = new Phaser.Geom.Point(100, 600);
    c = new Phaser.Geom.Point(playerLocalPx.x, playerLocalPx.y);

    this.shadowMapGfx.fillTriangle(a.x, a.y, b.x, b.y, c.x, c.y);
    */

    // Draw the shadow map
    this.shadowMap.draw(this.shadowMapGfx);
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
    this.outsideShadowOverlay.clear();
    this.ctx.gameScene.cameras.main.renderToTexture = true;
    this.tempHelperLines.clear();
  }
}
