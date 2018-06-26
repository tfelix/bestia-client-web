import * as LOG from 'loglevel';

import {
  VisualComponent, SpriteType, PositionComponent, ComponentType
} from 'entities/components';
import { Entity } from 'entities';
import { Point, Px } from 'model';
import { MapHelper } from 'map/MapHelper';

import { ComponentRenderer } from './ComponentRenderer';
import { EngineContext } from '../../EngineContext';
import { SpriteRenderer } from './SpriteRenderer';
import { ItemSpriteRenderer } from './ItemSpriteRenderer';
import { MultiSpriteRenderer } from './MultiSpriteRenderer';
import { SimpleSpriteRenderer } from './SimpleSpriteRenderer';

export interface SpriteData {
  sprite: Phaser.GameObjects.Sprite;
  spriteName: string;
  lastPlayedAnimation?: string;
  childSprites: Array<{
    spriteName: string;
    sprite: Phaser.GameObjects.Sprite;
  }>;
}

interface SpriteAnimation {
  name: string;
  from: number;
  to: number;
  fps: number;
}

export interface SpriteDescription {
  name: string;
  type: SpriteType;
  version: number;
  scale: number;
  animations: SpriteAnimation[];
  anchor: Point;
  multiSprite: string[];
  collision?: number[][];
}

export function getSpriteDescriptionFromCache(
  spriteName: string,
  scene: Phaser.Scene
): SpriteDescription {
  return scene.cache.json.get(`${spriteName}_desc`);
}

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

  protected removeComponent(entity: Entity, component: VisualComponent) {
  }
}
