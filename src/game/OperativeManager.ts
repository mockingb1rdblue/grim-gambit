import * as PIXI from 'pixi.js';
import { OperativeController, OperativeAnimationConfig } from './OperativeController';
import { GameStateUpdate } from './types';

/**
 * Manages multiple OperativeControllers and synchronizes them with backend updates.
 */
export class OperativeManager {
  private operatives: Map<string, OperativeController> = new Map();
  private stage: PIXI.Container;

  constructor(stage: PIXI.Container) {
    this.stage = stage;
  }

  public registerOperative(id: string, animations: OperativeAnimationConfig): void {
    const container = new PIXI.Container();
    this.stage.addChild(container);
    const controller = new OperativeController(container, animations);
    this.operatives.set(id, controller);
  }

  public handleUpdate(update: GameStateUpdate): void {
    const controller = this.operatives.get(update.operativeId);
    if (controller) {
      controller.setState(update.state);
    }
  }
}