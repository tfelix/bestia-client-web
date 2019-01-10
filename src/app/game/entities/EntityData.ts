import {
  SpriteData, DebugData, MoveData, ChatData, PerformData, ConditionData,
  FxData, HighlightData, ProjectileData
} from 'app/game/engine';
import { BuildingData } from '../engine/renderer/component/BuildingComponentRenderer';

export class EntityData {
  public visual?: SpriteData;
  public debug?: DebugData;
  public move?: MoveData;
  public condition?: ConditionData;
  public chat?: ChatData;
  public perform?: PerformData;
  public fx?: FxData;
  public highlight?: HighlightData;
  public projectile?: ProjectileData;
  public building?: BuildingData;
}
