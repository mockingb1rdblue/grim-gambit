import { AnimatedSprite, Texture } from 'pixi.js';

export type AnimationState = 'idle' | 'move' | 'shoot';

export interface DirectionalTextures {
  idle: Texture[];
  move: Texture[];
  shoot: Texture[];
}

/**
 * Controller for managing PixiJS AnimatedSprite states based on game logic.
 * Handles state transitions and directional orientation.
 */
export class SpriteController {
  private sprite: AnimatedSprite;
  private textures: Record<'up' | 'down' | 'left' | 'right', DirectionalTextures>;
  private currentState: AnimationState = 'idle';
  private currentDirection: 'up' | 'down' | 'left' | 'right' = 'down';

  constructor(
    sprite: AnimatedSprite,
    textures: Record<'up' | 'down' | 'left' | 'right', DirectionalTextures>
  ) {
    this.sprite = sprite;
    this.textures = textures;
    this.updateAnimation();
  }

  public setState(state: AnimationState): void {
    if (this.currentState !== state) {
      this.currentState = state;
      this.updateAnimation();
    }
  }

  public setDirection(vx: number, vy: number): void {
    let newDirection: 'up' | 'down' | 'left' | 'right' = this.currentDirection;

    if (Math.abs(vx) > Math.abs(vy)) {
      newDirection = vx > 0 ? 'right' : 'left';
    } else if (vy !== 0) {
      newDirection = vy > 0 ? 'down' : 'up';
    }

    if (this.currentDirection !== newDirection) {
      this.currentDirection = newDirection;
      this.updateAnimation();
    }
  }

  private updateAnimation(): void {
    const newTextures = this.textures[this.currentDirection][this.currentState];
    
    if (this.sprite.textures !== newTextures) {
      const frame = this.sprite.currentFrame;
      this.sprite.textures = newTextures;
      this.sprite.gotoAndPlay(frame < newTextures.length ? frame : 0);
    }
  }
}