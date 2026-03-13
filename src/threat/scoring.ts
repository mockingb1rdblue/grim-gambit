import { GameState, Unit } from './types';

/** 
 * Calculates the threat delta between a current state and a future state.
 * Returns a normalized score between 0 and 1.
 */
export function calculateThreatDelta(
  currentState: GameState,
  futureState: GameState
): number {
  const currentTotal = calculateTotalThreat(currentState);
  const futureTotal = calculateTotalThreat(futureState);

  // Calculate delta: how much the threat increased
  const delta = Math.max(0, futureTotal - currentTotal);

  // Normalize: Assuming a theoretical max threat delta of 100 per unit
  const normalized = Math.min(1, delta / (currentState.units.length * 100 + 1));

  return normalized;
}

/** 
 * Heuristic: Threat = (1 - health%) * weight + range * weight + coverBonus * weight
 */
function calculateTotalThreat(state: GameState): number {
  return state.units.reduce((acc, unit) => {
    const healthPercent = unit.health / unit.maxHealth;
    const healthThreat = (1 - healthPercent) * 40;
    const rangeThreat = unit.weaponRange * 5;
    const coverThreat = unit.coverBonus * 10;

    return acc + healthThreat + rangeThreat + coverThreat;
  }, 0);
}