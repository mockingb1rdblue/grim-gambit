import { setup } from 'xstate';

/** Game state machine configuration for Grim Gambit. */
export const gameMachine = setup({
  types: {
    context: {} as { turn: number; phase: 'planning' | 'execution' },
  },
}).createMachine({
  id: 'grim-gambit',
  initial: 'planning',
  context: {
    turn: 1,
    phase: 'planning',
  },
  states: {
    planning: {
      on: {
        COMMIT: { target: 'execution' },
      },
    },
    execution: {
      on: {
        FINISH: { target: 'planning', actions: 'incrementTurn' },
      },
    },
  },
});