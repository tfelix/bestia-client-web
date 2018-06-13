import { BaseCommonRenderer } from './BaseCommonRenderer';
import { EngineContext } from 'engine/EngineContext';
import { MapHelper } from 'map';

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

  private text: Phaser.GameObjects.Text | null = null;

  constructor(
    private readonly ctx: EngineContext
  ) {
    super();
  }

  public needsUpdate() {
    return this.ctx.config.debug.renderInfo;
  }

  public update() {
    if (!this.text) {
      this.createData();
    }
    this.updateData();
  }

  private createData() {
    this.text = this.ctx.game.add.text(
      50,
      50,
      '',
      DEBUG_STYLE
    );
    this.text.setDepth(1000 * 1000);
  }

  private updateData() {

    const camScrollX = Math.floor(this.ctx.game.cameras.main.scrollX);
    const camScrollY = Math.floor(this.ctx.game.cameras.main.scrollY);

    const pointerScreenX = Math.floor(this.ctx.game.input.activePointer.position.x);
    const pointerScreenY = Math.floor(this.ctx.game.input.activePointer.position.y);
    const pointerMapPos = MapHelper.pixelToPoint(pointerScreenX, pointerScreenY);

    let debugTxt = `Camera (scrollX: ${camScrollX} scrollY: ${camScrollY})`;
    debugTxt += `\nPointer (wx: ${pointerScreenX} wy: ${pointerScreenY} mx: ${pointerMapPos.x} my: ${pointerMapPos.y})`;

    this.text.setText(debugTxt);
    this.text.setPosition(this.ctx.game.cameras.main.scrollX + 50, this.ctx.game.cameras.main.scrollY + 50);
  }

  private clearAllData() {

  }
}
