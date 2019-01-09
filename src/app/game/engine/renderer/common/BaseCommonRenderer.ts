
export abstract class BaseCommonRenderer {
  public preload() { }
  public create() { }
  public abstract update();
  public abstract needsUpdate(): boolean;
}
