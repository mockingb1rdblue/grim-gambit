/**
 * Represents the possible states for a sprite animation.
 */
export enum AnimationState {
  Idle = 'idle',
  Shoot = 'shoot',
  Fight = 'fight',
}

/**
 * Represents a position on the grid.
 */
export interface GridPosition {
  x: number;
  y: number;
}

/**
 * Interface for the animation state controller.
 */
export interface ISpriteController {
  currentState: AnimationState;
  position: GridPosition;
  transitionTo(state: AnimationState): void;
  moveTo(target: GridPosition, durationMs: number): Promise<void>;
}

/**
 * SpriteController manages animation states and movement transitions.
 */
export class SpriteController implements ISpriteController {
  private _state: AnimationState = AnimationState.Idle;
  private _position: GridPosition;

  constructor(initialPosition: GridPosition) {
    this._position = { ...initialPosition };
  }

  public get currentState(): AnimationState {
    return this._state;
  }

  public get position(): GridPosition {
    return { ...this._position };
  }

  /**
   * Transitions the sprite to a new animation state.
   */
  public transitionTo(state: AnimationState): void {
    if (this._state !== state) {
      this._state = state;
    }
  }

  /**
   * Moves the sprite to a new grid position using a linear interpolation tween.
   */
  public async moveTo(target: GridPosition, durationMs: number): Promise<void> {
    const start = { ...this._position };
    const startTime = performance.now();

    return new Promise((resolve) => {
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);

        this._position.x = start.x + (target.x - start.x) * progress;
        this._position.y = start.y + (target.y - start.y) * progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this._position = { ...target };
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }
}