import * as LOG from 'loglevel';

import { VisualComponent, SpriteType } from 'entities/components';
import { Entity } from 'entities';
import { Px, Point } from 'model';
import { SpriteData, SpriteDescription, getSpriteDescriptionFromCache } from '.';
import { SpriteRenderer } from './SpriteRenderer';
import { EngineContext } from 'engine';

export interface SpriteOffsets {
  targetSprite: string;
  scale: number;
  defaultCords: {
    x: number;
    y: number;
  };
  offsets: Array<{
    name: string;
    triggered: string;
    offsets: Array<{
      x: number;
      y: number;
    }>;
  }>;
}

type StandAnimation = 'stand_down' | 'stand_up' | 'stand_left' | 'stand_right' | 'stand_down_left'
  | 'stand_up_left' | 'stand_down_right' | 'stand_up_right';

const DIRECTION_UP = new Point(0, -1);
const DIRECTION_DOWN = new Point(0, 1);
const DIRECTION_LEFT = new Point(-1, 0);
const DIRECTION_RIGHT = new Point(1, 0);
const DIRECTION_UP_LEFT = new Point(-1, -1).norm();
const DIRECTION_DOWN_LEFT = new Point(-1, 1).norm();
const DIRECTION_UP_RIGHT = new Point(1, -1);
const DIRECTION_DOWN_RIGHT = new Point(1, 1);

function translateSightPositionToAnimationName(sightDirection: Point): StandAnimation {
  if (Math.floor(sightDirection.scalarp(DIRECTION_DOWN)) === 1) {
    return 'stand_down';
  } else if (Math.floor(sightDirection.scalarp(DIRECTION_UP)) === 1) {
    return 'stand_up';
  } else if (Math.floor(sightDirection.scalarp(DIRECTION_LEFT)) === 1) {
    return 'stand_left';
  } else if (Math.floor(sightDirection.scalarp(DIRECTION_RIGHT)) === 1) {
    return 'stand_right';
  } else if (Math.floor(sightDirection.scalarp(DIRECTION_UP_LEFT)) === 1) {
    return 'stand_up_left';
  } else if (Math.floor(sightDirection.scalarp(DIRECTION_DOWN_LEFT)) === 1) {
    return 'stand_down_left';
  } else if (Math.floor(sightDirection.scalarp(DIRECTION_UP_RIGHT)) === 1) {
    return 'stand_up_right';
  } else {
    return 'stand_down_right';
  }
}

function translateMovementToSubspriteAnimationName(moveAnimation: string): string {
  switch (moveAnimation) {
    case 'stand_down':
    case 'walk_down':
      return 'bottom';
    case 'stand_down_left':
    case 'walk_down_left':
      return 'bottom_left';
    case 'stand_down_right':
    case 'walk_down_right':
      return 'bottom_right';
    case 'stand_left':
    case 'walk_left':
      return 'left';
    case 'stand_right':
    case 'walk_right':
      return 'right';
    case 'stand_up_left':
    case 'walk_up_left':
      return 'top_left';
    case 'stand_up_right':
    case 'walk_up_right':
      return 'top_right';
    case 'stand_up':
    case 'walk_up':
      return 'top';
    default:
      return moveAnimation;
  }
}

/**
 * WARNING: This is currently the same as MultiSpriteRenderer and must be refactored unto a own
 * unit.
 */
export class SimpleSpriteRenderer extends SpriteRenderer {

  constructor(
    private readonly ctx: EngineContext
  ) {
    super();
  }

  public supportedType(): SpriteType {
    return SpriteType.SIMPLE;
  }

  private getSpriteDescription(component: VisualComponent): SpriteDescription {
    return getSpriteDescriptionFromCache(component.sprite, this.ctx.game);
  }

  private setupMultiSprites(
    spriteData: SpriteData,
    desc: SpriteDescription
  ) {
    const multisprites = desc.multiSprite || [];

    multisprites.forEach(multiSprite => {
      LOG.debug(`Adding multisprite: ${multiSprite}`);

      // Get the desc file of the multisprite.
      const msDescName = `${multiSprite}_desc`;
      const msDesc = this.ctx.game.cache.json.get(msDescName) as SpriteDescription;
      const offsetFileName = this.getOffsetFilename(multiSprite, spriteData.spriteName);
      const offsets = this.ctx.game.cache.json.get(offsetFileName) as SpriteOffsets;

      // Was not loaded. Should not happen.
      if (!msDesc || !offsets) {
        LOG.warn(`Subsprite description of offsets were not loaded. This should not happen: ${msDescName}`);
        return;
      }

      const msSprite = this.ctx.game.add.sprite(0, 0, multiSprite);
      // this.setupScaleAndOrigin(msSprite, msDesc);
      this.setupSpriteAnimation(msSprite, msDesc);

      // Das hier evtl besser auslagern?
      const defaultOffset = offsets.defaultCords || { x: 0, y: 0 };
      const defaultScale = offsets.scale || 1;
      const anchor = msDesc.anchor || {
        x: 0.5,
        y: 0.5
      };
      msSprite.setOrigin(anchor.x, anchor.y);
      msSprite.setScale(defaultScale);

      spriteData.childSprites.push({
        spriteName: multiSprite,
        sprite: msSprite
      });
    });
  }

  private setupSightDirection(entity: Entity, component: VisualComponent) {
    const spriteData = entity.data.visual;
    const animationName = translateSightPositionToAnimationName(component.sightDirection);
    const fullAnimationName = `${component.sprite}_${animationName}`;
    LOG.debug(`Play sight animation: ${fullAnimationName} for entity: ${entity.id}`);
    this.setSpriteAnimationName(spriteData.sprite, fullAnimationName);
    this.updateChildSpritesAnimation(spriteData, animationName);
  }

  private setupOneshotAnimation(entity: Entity, component: VisualComponent) {
    const spriteData = entity.data.visual;
    const fullAnimationName = `${component.sprite}_${component.oneshotAnimation}`;
    LOG.debug(`Play oneshot animation: ${fullAnimationName} for entity: ${entity.id}`);
    this.setSpriteAnimationName(spriteData.sprite, fullAnimationName);
    this.updateChildSpritesAnimation(spriteData, component.oneshotAnimation);

    const animationDuration = spriteData.sprite.anims.getTotalFrames() * spriteData.sprite.anims.msPerFrame;

    const previousAnimationName = spriteData.lastPlayedAnimation;
    this.ctx.game.time.addEvent({
      delay: animationDuration,
      callback: () => component.animation = previousAnimationName
    });
  }

  private updateChildSpritesAnimation(spriteData: SpriteData, animationName: string) {
    spriteData.childSprites.forEach(childSprite => {
      const subspriteAnimationName = translateMovementToSubspriteAnimationName(animationName);
      const fullAnimationName = `${childSprite.spriteName}_${subspriteAnimationName}`;
      LOG.debug(`Play animation: ${fullAnimationName} for subsprite: ${childSprite.spriteName}`);
      this.setSpriteAnimationName(childSprite.sprite, fullAnimationName);
    });
  }

  private setSpriteAnimationName(sprite: Phaser.GameObjects.Sprite, animation: string) {
    if (this.needsMirror(animation)) {
      sprite.flipX = true;
      const correctedAnimationName = animation.replace('_right', '_left');
      sprite.anims.play(correctedAnimationName, true);
    } else {
      sprite.flipX = false;
      sprite.anims.play(animation, true);
    }
  }

  private needsMirror(animationName: string): boolean {
    return animationName.endsWith('right');
  }

  private updateChildSpriteOffset(
    spriteData: SpriteData
  ) {
    spriteData.childSprites.forEach(childSprite => {
      const mainSpriteDesc = this.ctx.game.cache.json.get(`${spriteData.spriteName}_desc`) as SpriteDescription;
      const offsetFileName = this.getOffsetFilename(childSprite.spriteName, spriteData.spriteName);
      const offsets = this.ctx.game.cache.json.get(offsetFileName) as SpriteOffsets;
      const defaultOffset = offsets.defaultCords || { x: 0, y: 0 };
      const defaultScale = offsets.scale || 1;

      const x = spriteData.sprite.x + defaultOffset.x * mainSpriteDesc.scale;
      const y = spriteData.sprite.y + defaultOffset.y * mainSpriteDesc.scale;

      childSprite.sprite.setPosition(
        x,
        y,
      );
    });
  }

  private getOffsetFilename(multispriteName, mainspriteName) {
    return `offset_${multispriteName}_${mainspriteName}`;
  }

  private setupScaleAndOrigin(sprite: Phaser.GameObjects.Sprite, description: SpriteDescription) {
    // Setup the normal data.
    const anchor = description.anchor || {
      x: 0.5,
      y: 0.5
    };
    sprite.setOrigin(anchor.x, anchor.y);
    const scale = description.scale || 1;
    sprite.setScale(scale);
  }

  /**
   * Helper function to setup a sprite with all the information contained
   * inside a description object.
   */
  private setupSpriteAnimation(sprite: Phaser.GameObjects.Sprite, description: SpriteDescription) {
    const anims = description.animations || [];
    const animsNames = anims.map(x => `${description.name}_${x.name}`);
    LOG.debug(`Setup sprite animations: ${animsNames} for: ${description.name}`);
    // Register all the animations of the sprite.
    anims.forEach(anim => {
      const config: GenerateFrameNamesConfig = {
        prefix: `${anim.name}/`,
        start: anim.from,
        zeroPad: 3,
        end: anim.to,
        suffix: '.png'
      };
      const animationFrames = this.ctx.game.anims.generateFrameNames(description.name, config);
      const animConfig = {
        key: `${description.name}_${anim.name}`,
        frames: animationFrames,
        frameRate: anim.fps,
        repeat: -1
      };
      this.ctx.game.anims.create(animConfig);
    });
  }

  public createGameData(entity: Entity, component: VisualComponent, pxPos: Px) {
    const desc = this.getSpriteDescription(component);
    const sprite = this.ctx.game.add.sprite(pxPos.x, pxPos.y, desc.name);
    this.setupSpriteData(sprite, entity, component.sprite);

    this.setupScaleAndOrigin(sprite, desc);
    this.setupSpriteAnimation(sprite, desc);

    this.setupMultiSprites(entity.data.visual, desc);
    this.updateChildSpriteOffset(entity.data.visual);
  }

  public updateGameData(entity: Entity, component: VisualComponent, pxPos: Px, spriteData: SpriteData) {

    if (component.animation) {
      spriteData.lastPlayedAnimation = component.animation;
      const fullAnimationName = `${component.sprite}_${component.animation}`;
      LOG.debug(`Play animation: ${fullAnimationName} for entity: ${entity.id}`);
      this.setSpriteAnimationName(spriteData.sprite, fullAnimationName);
      this.updateChildSpritesAnimation(spriteData, component.animation);
      component.animation = null;
    }

    if (component.oneshotAnimation) {
      this.setupOneshotAnimation(entity, component);
      component.oneshotAnimation = null;
    }

    if (component.sightDirection) {
      this.setupSightDirection(entity, component);
      component.sightDirection = null;
    }

    this.updateChildSpriteOffset(spriteData);
    this.updateSpriteDepth(spriteData);
  }
}
