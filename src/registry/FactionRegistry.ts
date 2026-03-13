import { z } from 'zod';
import { FactionRegistrySchema, type FactionRegistryData } from '../types/faction';

export class FactionRegistry {
  private data: FactionRegistryData = { squads: [], legionaries: [] };

  /**
   * Loads and validates faction data from a raw JSON payload.
   * Throws an error if validation fails.
   */
  public loadFromJSON(payload: unknown): void {
    const result = FactionRegistrySchema.safeParse(payload);

    if (!result.success) {
      throw new Error(`Invalid Faction Registry data: ${result.error.message}`);
    }

    this.data = result.data;
  }

  public getSquads() {
    return this.data.squads;
  }

  public getLegionaries() {
    return this.data.legionaries;
  }
}