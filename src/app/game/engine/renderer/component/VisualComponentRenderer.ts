import * as LOG from 'loglevel';

import {
  Entity, VisualComponent, PositionComponent, ComponentType
} from 'app/game/entities';
import { Point } from 'app/game/model';

import { MapHelper } from '../../MapHelper';
import { ComponentRenderer } from './ComponentRenderer';
import { EngineContext } from '../../EngineContext';
import { SpriteRenderer } from './SpriteRenderer';
import { ItemSpriteRenderer } from './ItemSpriteRenderer';
import { MultiSpriteRenderer } from './MultiSpriteRenderer';
import { SimpleSpriteRenderer } from './SimpleSpriteRenderer';
import { SpriteType } from './SpriteDescription';

export class VisualComponentRenderer extends ComponentRenderer<VisualComponent> {

  private readonly spriteRenderer = new Map<SpriteType, SpriteRenderer>();

  constructor(
    private readonly ctx: EngineContext
  ) {
    super(ctx.game);

    this.addSpriteRenderer(new ItemSpriteRenderer(ctx));
    this.addSpriteRenderer(new MultiSpriteRenderer(ctx));
    this.addSpriteRenderer(new SimpleSpriteRenderer(ctx));
  }

  private addSpriteRenderer(renderer: SpriteRenderer) {
    this.spriteRenderer.set(renderer.supportedType(), renderer);
  }

  get supportedComponent(): ComponentType {
    return ComponentType.VISUAL;
  }

  protected hasNotSetup(entity: Entity, component: VisualComponent): boolean {
    return !entity.data.visual;
  }

  protected createGameData(entity: Entity, component: VisualComponent) {
    LOG.debug(`Entity: ${entity.id} Visual: ${component.id} (${component.sprite})`);
    const posComp = entity.getComponent(ComponentType.POSITION) as PositionComponent;
    if (!posComp) {
      return;
    }
    const position = posComp.position || new Point(0, 0);
    const px = MapHelper.pointToPixelCentered(position);

    const renderer = this.spriteRenderer.get(component.spriteType);
    if (!renderer) {
      LOG.warn(`No sprite render present for type: ${component.spriteType}`);
      return;
    }

    renderer.createGameData(entity, component, px);
  }

  protected updateGameData(entity: Entity, component: VisualComponent) {
    const spriteData = entity.data.visual;
    if (!spriteData) {
      return;
    }

    const posComp = entity.getComponent(ComponentType.POSITION) as PositionComponent;
    if (!posComp) {
      return;
    }
    const px = MapHelper.pointToPixelCentered(posComp.position);

    const renderer = this.spriteRenderer.get(component.spriteType);
    if (!renderer) {
      LOG.warn(`No sprite render present for type: ${component.spriteType}`);
      return;
    }

    renderer.updateGameData(entity, component, px, spriteData);
  }

  public removeGameData(entity: Entity) {
    if (!entity.data.visual) {
      return;
    }
    entity.data.visual.sprite.destroy();
    entity.data.visual.childSprites.forEach(s => s.sprite.destroy());
    entity.data.visual = null;
  }
}
