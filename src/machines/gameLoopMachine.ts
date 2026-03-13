import { setup, assign } from 'xstate';

/** 
 * Represents the status of an operative in the game.
 */
export interface Operative {
  id: string;
  hasActionsRemaining: boolean;
}

/** 
 * Context for the game loop machine.
 */
export interface GameLoopContext {
  operatives: Operative[];
}

/** 
 * Events that can trigger transitions in the game loop.
 */
export type GameLoopEvent = 
  | { type: 'NEXT_PHASE' }
  | { type: 'UPDATE_OPERATIVE'; operative: Operative };

/**
 * Game Loop Machine implementation using XState v5.
 */
export const gameLoopMachine = setup({
  types: {
    context: {} as GameLoopContext,
    events: {} as GameLoopEvent,
  },
  guards: {
    canProgressToNextPhase: ({ context }) => {
      return !context.operatives.some((op) => op.hasActionsRemaining);
    },
  },
  actions: {
    updateOperative: assign(({ context, event }) => {
      if (event.type !== 'UPDATE_OPERATIVE') return {};
      const updatedOperatives = context.operatives.map((op) =>
        op.id === event.operative.id ? event.operative : op
      );
      return { operatives: updatedOperatives };
    }),
  },
}).createMachine({
  id: 'gameLoop',
  initial: 'strategy',
  context: {
    operatives: [],
  },
  on: {
    UPDATE_OPERATIVE: {
      actions: 'updateOperative',
    },
  },
  states: {
    strategy: {
      on: {
        NEXT_PHASE: {
          target: 'firefight',
          guard: 'canProgressToNextPhase',
        },
      },
    },
    firefight: {
      on: {
        NEXT_PHASE: {
          target: 'turningPoint',
          guard: 'canProgressToNextPhase',
        },
      },
    },
    turningPoint: {
      on: {
        NEXT_PHASE: {
          target: 'strategy',
        },
      },
    },
  },
});