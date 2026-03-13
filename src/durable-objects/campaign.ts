import { DurableObject } from "cloudflare:workers";

export interface CampaignState {
  xp: number;
  battleHonours: number;
  requisition: number;
  intel: number;
}

export class Campaign extends DurableObject {
  private readonly state: DurableObjectState;

  constructor(state: DurableObjectState, _env: unknown) {
    super(state, _env);
    this.state = state;
  }

  /**
   * Atomically increments XP and Battle Honours.
   */
  async addProgress(xpDelta: number, honoursDelta: number): Promise<CampaignState> {
    return await this.state.storage.transaction(async (txn) => {
      const current = (await txn.get<CampaignState>("state")) ?? {
        xp: 0,
        battleHonours: 0,
        requisition: 0,
        intel: 0,
      };

      const next = {
        ...current,
        xp: current.xp + xpDelta,
        battleHonours: current.battleHonours + honoursDelta,
      };

      await txn.put("state", next);
      return next;
    });
  }

  /**
   * Atomically updates resources (Requisition/Intel) to prevent double-spending.
   * Positive deltas add, negative deltas subtract.
   */
  async updateResources(requisitionDelta: number, intelDelta: number): Promise<CampaignState> {
    return await this.state.storage.transaction(async (txn) => {
      const current = (await txn.get<CampaignState>("state")) ?? {
        xp: 0,
        battleHonours: 0,
        requisition: 0,
        intel: 0,
      };

      const nextRequisition = current.requisition + requisitionDelta;
      const nextIntel = current.intel + intelDelta;

      if (nextRequisition < 0 || nextIntel < 0) {
        throw new Error("Insufficient resources: Transaction aborted.");
      }

      const next = {
        ...current,
        requisition: nextRequisition,
        intel: nextIntel,
      };

      await txn.put("state", next);
      return next;
    });
  }

  async getState(): Promise<CampaignState> {
    return (await this.state.storage.get<CampaignState>("state")) ?? {
      xp: 0,
      battleHonours: 0,
      requisition: 0,
      intel: 0,
    };
  }
}