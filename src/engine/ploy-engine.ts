/**
 * Ploy types and restrictions definitions.
 */
export type Phase = 'Strategic' | 'Firefight';

export interface Ploy {
  id: string;
  name: string;
  cost: number;
  phase: Phase;
}

export interface GameState {
  currentPhase: Phase;
  commandPoints: number;
}

/**
 * Validates if a ploy can be activated based on phase and CP availability.
 */
export function canActivatePloy(
  state: GameState,
  ploy: Ploy
): { allowed: boolean; reason?: string } {
  if (state.currentPhase !== ploy.phase) {
    return {
      allowed: false,
      reason: `Ploy can only be activated during the ${ploy.phase} phase.`,
    };
  }

  if (state.commandPoints < ploy.cost) {
    return {
      allowed: false,
      reason: 'Insufficient Command Points.',
    };
  }

  return { allowed: true };
}

/**
 * Processes the expenditure of Command Points for a ploy.
 */
export function spendCP(state: GameState, cost: number): GameState {
  if (state.commandPoints < cost) {
    throw new Error('Cannot spend more CP than available.');
  }

  return {
    ...state,
    commandPoints: state.commandPoints - cost,
  };
}