export class ShaderPipeline extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline {

  constructor(game: Phaser.Game, shaderName: string) {
    super({
      game: game,
      renderer: game.renderer,
      fragShader: game.cache.shader.get(shaderName)
    });
  }
}
