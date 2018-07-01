import { BaseCommonRenderer } from './BaseCommonRenderer';
import { EngineContext } from 'engine';
import { GameScene } from 'scenes/GameScene';

export class UIModalRenderer extends BaseCommonRenderer {

  constructor(
    private readonly ctx: EngineContext
  ) {
    super();
  }

  public update() {
    const gameScene = this.ctx.game as GameScene;
    const modalText = this.ctx.data.uiModal.shift();
    gameScene.dialogModal.setText(modalText);
  }

  public needsUpdate(): boolean {
    return this.ctx.data.uiModal.length > 0;
  }
}
