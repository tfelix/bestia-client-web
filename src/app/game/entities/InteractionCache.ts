import { EntityTraits, ComponentType, VisualComponent } from './components';
import { InteractionType } from './components/local/InteractionLocalComponent';
import { Entity } from './Entity';

export class InteractionService {

  private readonly interactionCache: Map<string, InteractionType> = new Map();

  constructor() {
    this.interactionCache.set(EntityTraits.ATTACKABLE, InteractionType.ATTACK);
    this.interactionCache.set(EntityTraits.LOOTABLE, InteractionType.LOOT);
  }

  public getDefaultInteraction(entity: Entity): InteractionType | null {


    return this.interactionCache.get(type);
  }

  private getUserPrimaryInteraction(entity: Entity): InteractionType | null {
    const hash = this.getInteractionHash(entity);
  }

  private getDefaultInteraction(entity: Entity): InteractionType {

  }

  private getInteractionHash(entity: Entity): string {
    const visualComponent = entity.getComponent(ComponentType.VISUAL) as VisualComponent;

    return visualComponent && visualComponent.sprite || entity.id.toString();
  }
}
