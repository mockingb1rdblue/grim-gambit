import { setup, assign, StateMachine } from 'xstate';

export interface GameContext {
  turn: number;
  phase: 'Strategy' | 'Firefight' | 'TurningPoint';
  score: number;
}

export type GameEvent =
  | { type: 'NEXT_PHASE' }
  | { type: 'RESET' };

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
  },
  guards: {
    isLastPhase: ({ context }) => context.phase === 'TurningPoint',
  },
  actions: {
    incrementTurn: assign({
      turn: ({ context }) => context.turn + 1,
    }),
    advancePhase: assign({
      phase: ({ context }) => {
        switch (context.phase) {
          case 'Strategy': return 'Firefight';
          case 'Firefight': return 'TurningPoint';
          case 'TurningPoint': return 'Strategy';
        }
      },
    }),
  },
}).createMachine({
  id: 'gameLoop',
  initial: 'Strategy',
  context: {
    turn: 1,
    phase: 'Strategy',
    score: 0,
  },
  states: {
    Strategy: {
      on: {
        NEXT_PHASE: {
          target: 'Firefight',
          actions: ['advancePhase'],
        },
      },
    },
    Firefight: {
      on: {
        NEXT_PHASE: {
          target: 'TurningPoint',
          actions: ['advancePhase'],
        },
      },
    },
    TurningPoint: {
      on: {
        NEXT_PHASE: {
          target: 'Strategy',
          actions: ['advancePhase', 'incrementTurn'],
        },
      },
    },
  },
});