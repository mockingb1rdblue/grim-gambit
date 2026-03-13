/**
 * Represents the current combat state for decision making.
 */
export interface CombatState {
  health: number;
  enemyHealth: number;
  stamina: number;
  enemyLastAction: 'strike' | 'block' | 'idle';
}

/**
 * Represents the possible actions an agent can take.
 */
export type Action = 'strike' | 'block';

/**
 * Strategy engine to determine the optimal move based on resource thresholds.
 * 
 * Logic:
 * - If health is critical (< 20%), prioritize blocking.
 * - If stamina is high and enemy health is low, prioritize striking to finish.
 * - Otherwise, balance based on enemy behavior.
 */
export function determineOptimalAction(state: CombatState): Action {
  const { health, stamina, enemyLastAction } = state;

  // Critical health safety check
  if (health < 20 && stamina > 10) {
    return 'block';
  }

  // Aggressive finisher
  if (state.enemyHealth < 15 && stamina > 5) {
    return 'strike';
  }

  // Reactive logic
  if (enemyLastAction === 'strike') {
    return 'block';
  }

  return 'strike';
}