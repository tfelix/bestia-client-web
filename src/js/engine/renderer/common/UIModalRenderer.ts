import { BaseCommonRenderer } from './BaseCommonRenderer';
import { EngineContext } from 'engine';
import { UiScene } from 'scenes/UiScene';

export class UIModalRenderer extends BaseCommonRenderer {

  constructor(
    private readonly ctx: EngineContext
  ) {
    super();
  }

  public update() {
    const uiScene = this.ctx.game.scene.get('UiScene') as UiScene;
    const modalText = this.ctx.data.uiModal.shift();
    uiScene.dialogModal.setText(modalText);
  }

  public needsUpdate(): boolean {
    return this.ctx.data.uiModal.length > 0;
  }
}
