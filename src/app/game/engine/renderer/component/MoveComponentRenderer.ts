import * as LOG from 'loglevel';

import {
  Entity, ComponentType, MoveComponent, VisualComponent, PositionComponent
} from 'app/game/entities';
import { Point, Px } from 'app/game/model';

import { MapHelper } from '../../MapHelper';
import { ComponentRenderer } from './ComponentRenderer';
import { EngineContext } from '../../EngineContext';

type WalkAnimationName = 'walk_up' | 'walk_up_right' | 'walk_right' | 'walk_down_right' |
  'walk_down' | 'walk_down_left' | 'walk_left' | 'walk_up_left';

type StandAnimationName = 'stand_up' | 'stand_up_right' | 'stand_right' | 'stand_down_right' |
  'stand_down' | 'stand_down_left' | 'stand_left' | 'stand_up_left';

export interface MoveData {
  currentMoveComponentId: number;
  currentValidStandAnimation: string;
  timeline: Phaser.Tweens.Timeline;
}

/**
 * Returns the animation name for walking to this position, from the old
 * position.
 */
function getWalkAnimationName(oldPos: Point, newPos: Point): WalkAnimationName {

  let x = newPos.x - oldPos.x;
  let y = newPos.y - oldPos.y;

  if (x > 1) {
    x = 1;
  }
  if (y > 1) {
    y = 1;
  }

  if (x === 0 && y === -1) {
    return 'walk_up';
  } else if (x === 1 && y === -1) {
    return 'walk_up_right';
  } else if (x === 1 && y === 0) {
    return 'walk_right';
  } else if (x === 1 && y === 1) {
    return 'walk_down_right';
  } else if (x === 0 && y === 1) {
    return 'walk_down';
  } else if (x === -1 && y === 1) {
    return 'walk_down_left';
  } else if (x === -1 && y === 0) {
    return 'walk_left';
  } else {
    return 'walk_up_left';
  }
}

/**
 * Returns the animation name for standing to this position.
 */
function getStandAnimationName(oldPos: Point, newPos: Point): StandAnimationName {
  let x = newPos.x - oldPos.x;
  let y = newPos.y - oldPos.y;

  if (x > 1) {
    x = 1;
  }
  if (y > 1) {
    y = 1;
  }

  if (x === 0 && y === -1) {
    return 'stand_up';
  } else if (x === 1 && y === -1) {
    return 'stand_up_right';
  } else if (x === 1 && y === 0) {
    return 'stand_right';
  } else if (x === 1 && y === 1) {
    return 'stand_down_right';
  } else if (x === 0 && y === 1) {
    return 'stand_down';
  } else if (x === -1 && y === 1) {
    return 'stand_down_left';
  } else if (x === -1 && y === 0) {
    return 'stand_left';
  } else {
    return 'stand_up_left';
  }
}

export class MoveComponentRenderer extends ComponentRenderer<MoveComponent> {

  constructor(
    private readonly ctx: EngineContext,
  ) {
    super(ctx.game);
  }

  get supportedComponent(): ComponentType {
    return ComponentType.MOVE;
  }

  protected hasNotSetup(entity: Entity, component: MoveComponent): boolean {
    const isMoveNotEmpty = component.path.length !== 0;
    return isMoveNotEmpty && (!entity.data.move || entity.data.move.currentMoveComponentId !== component.id);
  }

  private startMovementTimeline(entity: Entity, component: MoveComponent) {
    const moveData = entity.data.move;
    const spriteData = entity.data.visual;
    const visual = entity.getComponent(ComponentType.VISUAL) as VisualComponent;
    if (!visual || !spriteData) {
      LOG.warn('Can not display walking animation because no visual component exists.');
      return;
    }

    const moveTweens = [];

    for (let x = 0; x < component.path.length - 1; x++) {
      const currentPos = component.path[x];
      const nextPosition = component.path[x + 1];
      const isLastStep = x + 2 === component.path.length;

      // If the are currently in the transition between tiles in order to calculate the correct
      // movement speed we need to use the pixel position for the first step.
      let currentPosPx: Px;
      if (x === 0) {
        currentPosPx = new Px(spriteData.sprite.x, spriteData.sprite.y);
      } else {
        currentPosPx = MapHelper.pointToPixelCentered(currentPos);
      }

      const targetPosPx = MapHelper.pointToPixelCentered(nextPosition);
      const stepDuration = MapHelper.getWalkDuration(currentPosPx, targetPosPx, component.walkspeed);
      const standAnimation = getStandAnimationName(currentPos, nextPosition);
      const walkAnimation = getWalkAnimationName(currentPos, nextPosition);

      const tween = {
        duration: stepDuration,
        x: targetPosPx.x,
        y: targetPosPx.y,
        onStart: () => {
          entity.data.move.currentValidStandAnimation = standAnimation;
          visual.animation = walkAnimation;
        },
        onComplete: () => { }
      };

      if (isLastStep) {
        tween.onComplete = () => {
          entity.removeComponentByType(component.type);
          component.onMoveFinished.forEach(fn => fn());
        };
      }

      moveTweens.push(tween);
    }

    moveData.timeline = this.game.tweens.timeline({
      targets: spriteData.sprite,
      ease: 'Linear',
      tweens: moveTweens
    });
  }

  protected createGameData(entity: Entity, component: MoveComponent) {
    const moveData: MoveData = {
      currentValidStandAnimation: '',
      currentMoveComponentId: component.id,
      timeline: null
    };
    entity.data.move = moveData;

    this.startMovementTimeline(entity, component);
  }

  protected updateGameData(entity: Entity, component: MoveComponent) {
  }

  public removeGameData(entity: Entity) {
    if (!entity.data.move) {
      return;
    }

    if (entity.data.move.timeline) {
      entity.data.move.timeline.stop();
    }

    const visual = entity.getComponent(ComponentType.VISUAL) as VisualComponent;
    if (!!visual) {
      visual.animation = entity.data.move.currentValidStandAnimation;
    }

    entity.data.move = null;
  }
}
