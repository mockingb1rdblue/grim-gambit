import { Application } from 'pixi.js';
import { createMachine, interpret } from 'xstate';
import { GameState } from '../types/game';

export class GameEngine {
  private app: Application;
  private state: GameState;

  constructor(app: Application, initialState: GameState) {
    this.app = app;
    this.state = initialState;
    this.init();
  }

  private init(): void {
    this.app.ticker.add((ticker) => {
      this.update(ticker.deltaTime);
    });
  }

  private update(_deltaTime: number): void {
    // Game logic tick
  }

  public getSnapshot(): GameState {
    return this.state;
  }
}

export const gameMachine = createMachine({
  id: 'game',
  initial: 'idle',
  states: {
    idle: {
      on: { MOVE: 'moving' }
    },
    moving: {
      on: { ATTACK: 'attacking', WAIT: 'idle' }
    },
    attacking: {
      on: { FINISH: 'idle' }
    }
  }
});