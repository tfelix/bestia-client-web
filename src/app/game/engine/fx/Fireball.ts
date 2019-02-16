import { EngineContext } from '../EngineContext';
import { AtlasFx, FxConstants } from './FxConstants';

class Fireball {

  constructor(
    private ctx: EngineContext
  ) {
  }

  private setupAnimations() {
    this.ctx.gameScene.anims.create({
      key: FxConstants.FIREBALL_1,
      frames: this.ctx.gameScene.anims.generateFrameNames(
        AtlasFx,
        { prefix: 'fire_1/', end: 2, zeroPad: 3, suffix: '.png' }
      ),
      repeat: -1,
      frameRate: 1
    });
  }

  public play() {

  }

  public destroy() {
    // Clears up all resources
  }
}
