/** Represents the current state of a unit for threat calculation. */
export interface Unit {
  id: string;
  health: number;
  maxHealth: number;
  weaponRange: number;
  coverBonus: number;
}

/** Represents the board state for threat calculation. */
export interface GameState {
  units: Unit[];
}