import { HexCoordinate, getHexDistance } from '../utils/coordinates';

export interface UnitStats {
  movement: number;
}

/**
 * Validates if a movement action (Dash or Reposition) is within the unit's capabilities.
 */
export function validateMovement(
  start: HexCoordinate,
  end: HexCoordinate,
  stats: UnitStats,
  actionType: 'Dash' | 'Reposition'
): boolean {
  const distance = getHexDistance(start, end);

  switch (actionType) {
    case 'Dash':
      // Dash typically allows double the base movement
      return distance <= stats.movement * 2;
    case 'Reposition':
      // Reposition typically allows up to base movement
      return distance <= stats.movement;
    default:
      const _exhaustiveCheck: never = actionType;
      return false;
  }
}