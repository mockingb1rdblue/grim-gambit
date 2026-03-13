import { Phase } from './ploy-engine';

/**
 * Defines valid transitions for the game state machine.
 */
export type GameEvent = 
  | { type: 'START_PHASE'; phase: Phase }
  | { type: 'ACTIVATE_PLOY'; ployId: string };

export interface MachineState {
  value: 'Idle' | 'StrategicPhase' | 'FirefightPhase';
  context: {
    commandPoints: number;
  };
}

/**
 * Transitions the machine based on events.
 */
export function transition(
  state: MachineState,
  event: GameEvent
): MachineState {
  switch (event.type) {
    case 'START_PHASE':
      return {
        ...state,
        value: event.phase === 'Strategic' ? 'StrategicPhase' : 'FirefightPhase',
      };
    case 'ACTIVATE_PLOY':
      // The actual validation logic is handled by the ploy-engine,
      // this ensures the machine is in a valid state to process events.
      if (state.value === 'Idle') {
        throw new Error('Cannot activate ploys while in Idle state.');
      }
      return state;
    default:
      return state;
  }
}