import { BaseCommonRenderer } from './BaseCommonRenderer';
import { EngineContext } from '../../EngineContext';
import { UiDialogScene } from '../../scenes/UiDialogScene';
import { SceneNames } from '../../scenes/SceneNames';

export class UiModalRenderer extends BaseCommonRenderer {

  constructor(
    private readonly ctx: EngineContext
  ) {
    super();
  }

  public update() {
    const uiScene = this.ctx.game.scene.get(SceneNames.UI_DIALOG) as UiDialogScene;
    const modalText = this.ctx.data.uiModal.shift();
    uiScene.dialogModal.setText(modalText);
  }

  public needsUpdate(): boolean {
    return this.ctx.data.uiModal.length > 0;
  }
}
