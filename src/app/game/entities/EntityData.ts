import { SpriteData, DebugData, MoveData } from 'engine/renderer';
import { ConditionData } from 'engine/renderer/component/ConditionComponentRenderer';
import { ChatData } from 'engine/renderer/actions/ChatActionsRenderer';
import { PerformData } from 'engine/renderer/component/PerformComponentRenderer';

export class EntityData {
  public visual?: SpriteData;
  public debug?: DebugData;
  public move?: MoveData;
  public condition?: ConditionData;
  public chat?: ChatData;
  public perform?: PerformData;
}
