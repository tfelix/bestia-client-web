import { EngineContext } from '../../EngineContext';
import { BaseCommonRenderer } from './BaseCommonRenderer';
import { DisplayHelper } from '../../DisplayHelper';
import { MapHelper } from '../../MapHelper';

const DEBUG_STYLE = {
  fontFamily: 'Courier New',
  fontSize: 12,
  color: '#FFFFFF',
  boundsAlignH: 'center',
  boundsAlignV: 'left'
};

/**
 * Renders Debug Information on screen.
 */
export class DebugInfoRenderer extends BaseCommonRenderer {

  private readonly textOffsetX = 200;
  private readonly textOffsetY = 20;

  private text: Phaser.GameObjects.Text | null = null;
  private lastRenderTime = null;
  private renderFrameTimesMs = [];
  private displayHelper: DisplayHelper;

  constructor(
    private readonly ctx: EngineContext
  ) {
    super();

    this.displayHelper = new DisplayHelper(ctx.game);
  }

  public needsUpdate(): boolean {
    const shouldRender = this.ctx.config.debug.renderInfo;
    const shouldCleanData = !this.ctx.config.debug.renderInfo && !!this.text;
    return shouldRender || shouldCleanData;
  }

  public update() {
    const shouldCleanData = !this.ctx.config.debug.renderInfo && !!this.text;
    if (shouldCleanData) {
      this.clearAllData();
      return;
    }

    if (!this.text) {
      this.createData();
    }
    this.takeFpsMeasurement();
    this.updateData();
  }

  private createData() {
    this.text = this.ctx.game.add.text(
      this.textOffsetX,
      this.textOffsetY,
      '',
      DEBUG_STYLE
    );
    this.text.setDepth(1000 * 1000);
  }

  private takeFpsMeasurement() {
    const d = this.ctx.game.time.now - this.lastRenderTime;
    this.renderFrameTimesMs.push(d);
    while (this.renderFrameTimesMs.length > 5) {
      this.renderFrameTimesMs.shift();
    }
    this.lastRenderTime = this.ctx.game.time.now;
  }

  private updateData() {

    const camScrollX = Math.floor(this.ctx.game.cameras.main.scrollX);
    const camScrollY = Math.floor(this.ctx.game.cameras.main.scrollY);

    const pointerScreenX = Math.floor(this.ctx.game.input.activePointer.position.x);
    const pointerScreenY = Math.floor(this.ctx.game.input.activePointer.position.y);
    const scrollOffset = this.displayHelper.getScrollOffset();
    const pointerMapPos = MapHelper.pixelToPoint(pointerScreenX, pointerScreenY).plus(scrollOffset);

    const fps = Math.round(1000 / (this.renderFrameTimesMs.reduce((sum, v) => sum + v) / this.renderFrameTimesMs.length));

    let debugTxt = `FPS: ${fps}`;
    debugTxt += `\nCamera (scrollX: ${camScrollX} scrollY: ${camScrollY})`;
    debugTxt += `\nPointer (wx: ${pointerScreenX} wy: ${pointerScreenY} mx: ${pointerMapPos.x} my: ${pointerMapPos.y})`;

    this.text.setText(debugTxt);
    this.text.setPosition(
      this.ctx.game.cameras.main.scrollX + this.textOffsetX,
      this.ctx.game.cameras.main.scrollY + this.textOffsetY
    );
  }

  private clearAllData() {
    this.text.destroy();
    this.text = null;
  }
}
