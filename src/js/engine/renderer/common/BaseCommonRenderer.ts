
export abstract class BaseCommonRenderer {
  public create() { }
  public abstract update();
  public abstract needsUpdate(): boolean;
}
