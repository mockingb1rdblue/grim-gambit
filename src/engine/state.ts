import { createMachine, assign } from 'xstate';
import { GameState, GameEvent } from './types';

export const gameMachine = createMachine<GameState, GameEvent>({
  id: 'grim-gambit',
  initial: 'idle',
  context: {
    entities: [],
    turn: 1,
    phase: 'idle',
  },
  states: {
    idle: {
      on: {
        START_PLANNING: {
          target: 'planning',
          actions: assign({ phase: () => 'planning' }),
        },
      },
    },
    planning: {
      on: {
        SUBMIT_ACTIONS: {
          target: 'executing',
          actions: assign({ phase: () => 'executing' }),
        },
      },
    },
    executing: {
      on: {
        RESOLVE_TURN: {
          target: 'idle',
          actions: assign({
            turn: (context) => context.turn + 1,
            phase: () => 'idle',
          }),
        },
      },
    },
  },
});