import {
  SpriteData, DebugData, MoveData, ChatData, PerformData, ConditionData,
  FxData
} from 'app/game/engine';

export class EntityData {
  public visual?: SpriteData;
  public debug?: DebugData;
  public move?: MoveData;
  public condition?: ConditionData;
  public chat?: ChatData;
  public perform?: PerformData;
  public fx?: FxData;
}
