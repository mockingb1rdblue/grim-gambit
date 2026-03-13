import { Faction, Unit } from '../schemas/faction';

export interface Roster {
  factionId: string;
  units: Unit[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class RosterBuilder {
  private faction: Faction;

  constructor(faction: Faction) {
    this.faction = faction;
  }

  public validate(roster: Roster): ValidationResult {
    const errors: string[] = [];

    if (roster.factionId !== this.faction.id) {
      errors.push(`Faction mismatch: expected ${this.faction.id}, got ${roster.factionId}`);
    }

    const totalPoints = roster.units.reduce((sum, unit) => sum + unit.points, 0);

    if (totalPoints > this.faction.maxPoints) {
      errors.push(`Total points ${totalPoints} exceeds limit of ${this.faction.maxPoints}`);
    }

    // Verify all units exist in the faction definition
    for (const unit of roster.units) {
      const exists = this.faction.units.some((u) => u.id === unit.id);
      if (!exists) {
        errors.push(`Unit ${unit.name} (${unit.id}) is not valid for this faction`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}