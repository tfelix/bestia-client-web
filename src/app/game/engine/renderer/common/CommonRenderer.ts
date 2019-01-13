
/**
 * The CommonRenderer operate on global game data which is most likly set via custom made
 * messages from the server. They usually dont depend on single entities and dont use the
 * entity system primarily to render visuals.
 *
 * Good example for example for such renderer is the global weather or lighting.
 */
export abstract class CommonRenderer {
  public preload() { }
  public create() { }
  public abstract update();
  public abstract needsUpdate(): boolean;
}
