import { setup, assign, type ActorRefFrom } from 'xstate';
import { operativeMachine } from './operativeMachine';

export type GameContext = {
  phase: 'strategy' | 'firefight';
  operatives: Record<string, ActorRefFrom<typeof operativeMachine>>;
};

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as
      | { type: 'START_FIREFIGHT' }
      | { type: 'START_STRATEGY' },
  },
  actors: {
    operativeMachine,
  },
}).createMachine({
  id: 'game',
  initial: 'strategy',
  context: {
    phase: 'strategy',
    operatives: {},
  },
  states: {
    strategy: {
      on: {
        START_FIREFIGHT: {
          target: 'firefight',
          actions: assign({
            phase: 'firefight',
          }),
        },
      },
    },
    firefight: {
      on: {
        START_STRATEGY: {
          target: 'strategy',
          actions: assign({
            phase: 'strategy',
          }),
        },
      },
    },
  },
});