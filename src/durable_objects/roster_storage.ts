import { FactionRegistry } from "../registry/faction_registry";

export interface Roster {
  id: string;
  name: string;
  factionId: string;
  units: string[];
}

export class RosterStorage {
  state: DurableObjectState;
  factionRegistry: FactionRegistry;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.factionRegistry = new FactionRegistry();
  }

  /**
   * Retrieves a roster by ID.
   */
  async getRoster(id: string): Promise<Roster | null> {
    const roster = await this.state.storage.get<Roster>(`roster:${id}`);
    return roster ?? null;
  }

  /**
   * Saves or updates a roster after validating against the FactionRegistry.
   */
  async saveRoster(roster: Roster): Promise<{ success: boolean; error?: string }> {
    // Validate faction existence
    const faction = await this.factionRegistry.getFaction(roster.factionId);
    if (!faction) {
      return { success: false, error: "Invalid faction ID" };
    }

    // Validate units against faction rules
    const isValidUnits = roster.units.every((unitId) =>
      faction.allowedUnits.includes(unitId)
    );
    if (!isValidUnits) {
      return { success: false, error: "Units contain invalid entries for the selected faction" };
    }

    await this.state.storage.put(`roster:${roster.id}`, roster);
    return { success: true };
  }

  /**
   * Deletes a roster.
   */
  async deleteRoster(id: string): Promise<void> {
    await this.state.storage.delete(`roster:${id}`);
  }

  /**
   * Standard fetch handler for the Durable Object.
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (request.method === "GET" && id) {
      const roster = await this.getRoster(id);
      return new Response(JSON.stringify(roster), {
        headers: { "content-type": "application/json" },
      });
    }

    if (request.method === "POST") {
      const body = await request.json() as unknown;
      
      // Narrowing type
      if (this.isRoster(body)) {
        const result = await this.saveRoster(body);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 400,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response("Invalid roster format", { status: 400 });
    }

    return new Response("Method not allowed", { status: 405 });
  }

  private isRoster(data: unknown): data is Roster {
    return (
      typeof data === "object" &&
      data !== null &&
      "id" in data && typeof (data as Roster).id === "string" &&
      "name" in data && typeof (data as Roster).name === "string" &&
      "factionId" in data && typeof (data as Roster).factionId === "string" &&
      "units" in data && Array.isArray((data as Roster).units)
    );
  }
}