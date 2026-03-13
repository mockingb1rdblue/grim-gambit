import * as PIXI from 'pixi.js';

export type OperativeState = 'idle' | 'move' | 'shoot';

export interface OperativeAnimationConfig {
  idle: PIXI.AnimatedSprite;
  move: PIXI.AnimatedSprite;
  shoot: PIXI.AnimatedSprite;
}

/**
 * OperativeController manages the visual state machine for game operatives.
 * It maps game logic states to PixiJS animation sequences.
 */
export class OperativeController {
  private currentState: OperativeState = 'idle';
  private animations: OperativeAnimationConfig;
  private container: PIXI.Container;

  constructor(container: PIXI.Container, animations: OperativeAnimationConfig) {
    this.container = container;
    this.animations = animations;

    // Initialize: hide all, show idle
    Object.values(this.animations).forEach((anim) => {
      anim.visible = false;
      anim.loop = true;
      this.container.addChild(anim);
    });

    this.updateAnimationVisibility();
  }

  /**
   * Transitions the operative to a new state and updates the animation.
   */
  public setState(newState: OperativeState): void {
    if (this.currentState === newState) {
      return;
    }

    this.currentState = newState;
    this.updateAnimationVisibility();
  }

  private updateAnimationVisibility(): void {
    Object.entries(this.animations).forEach(([key, anim]) => {
      const isTarget = key === this.currentState;
      anim.visible = isTarget;
      if (isTarget) {
        anim.gotoAndPlay(0);
      } else {
        anim.stop();
      }
    });
  }

  /**
   * Should be called by the game loop to update animation frame delta.
   */
  public update(_deltaTime: number): void {
    // Current PixiJS AnimatedSprite handles its own frame updates if added to ticker
  }
}