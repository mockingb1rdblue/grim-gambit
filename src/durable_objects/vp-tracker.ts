import { DurableObject } from "cloudflare:workers";

export interface VPState {
  primary: number;
  secondary: number;
  turningPoint: number;
}

export interface GameState {
  phase: "setup" | "turning_point_1" | "turning_point_2" | "turning_point_3" | "turning_point_4" | "game_end";
}

/**
 * VPTracker Durable Object manages scoring across game phases.
 * Tracks Victory Points (VP) and enforces state transitions based on turning points.
 */
export class VPTracker extends DurableObject {
  private state: VPState = {
    primary: 0,
    secondary: 0,
    turningPoint: 1,
  };

  constructor(state: DurableObjectState, env: unknown) {
    super(state, env);
    this.ctx.blockConcurrencyWhile(async () => {
      const stored = await this.ctx.storage.get<VPState>("vp_state");
      if (stored) {
        this.state = stored;
      }
    });
  }

  /** Update VP scores for the current phase. */
  public async addVP(primary: number, secondary: number): Promise<VPState> {
    this.state.primary += primary;
    this.state.secondary += secondary;
    await this.ctx.storage.put("vp_state", this.state);
    return this.state;
  }

  /** Trigger transition to the next turning point. */
  public async transitionToPhase(phase: GameState["phase"]): Promise<VPState> {
    const tpMap: Record<GameState["phase"], number> = {
      setup: 1,
      turning_point_1: 1,
      turning_point_2: 2,
      turning_point_3: 3,
      turning_point_4: 4,
      game_end: 4,
    };

    this.state.turningPoint = tpMap[phase];
    await this.ctx.storage.put("vp_state", this.state);
    return this.state;
  }

  /** Fetch current state. */
  public async getStatus(): Promise<VPState> {
    return this.state;
  }
}