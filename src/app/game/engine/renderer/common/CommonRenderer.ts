
export abstract class CommonRenderer {
  public preload() { }
  public create() { }
  public abstract update();
  public abstract needsUpdate(): boolean;
}
