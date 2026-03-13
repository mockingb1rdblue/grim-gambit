/**
 * Faction Registry Service
 * Manages operative profiles and faction data caching.
 */

export interface OperativeProfile {
  id: string;
  factionId: string;
  name: string;
  role: string;
  level: number;
}

export interface IFactionRegistry {
  getOperative(id: string): OperativeProfile | undefined;
  cacheProfiles(profiles: OperativeProfile[]): void;
}

export class FactionRegistry implements IFactionRegistry {
  private readonly profileCache: Map<string, OperativeProfile> = new Map();

  /**
   * Retrieves an operative profile by ID from the cache.
   */
  public getOperative(id: string): OperativeProfile | undefined {
    return this.profileCache.get(id);
  }

  /**
   * Populates the cache with a batch of operative profiles.
   */
  public cacheProfiles(profiles: OperativeProfile[]): void {
    for (const profile of profiles) {
      this.profileCache.set(profile.id, profile);
    }
  }
}