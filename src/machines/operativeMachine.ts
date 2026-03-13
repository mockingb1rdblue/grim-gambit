import { setup, assign } from 'xstate';

export type OperativeContext = {
  id: string;
  isActivated: boolean;
};

export const operativeMachine = setup({
  types: {
    context: {} as OperativeContext,
    events: {} as { type: 'ACTIVATE' } | { type: 'RESET' },
  },
}).createMachine({
  id: 'operative',
  initial: 'idle',
  context: ({ input }) => ({
    id: (input as { id: string }).id,
    isActivated: false,
  }),
  states: {
    idle: {
      on: {
        ACTIVATE: {
          target: 'activated',
          actions: assign({
            isActivated: true,
          }),
        },
      },
    },
    activated: {
      on: {
        RESET: {
          target: 'idle',
          actions: assign({
            isActivated: false,
          }),
        },
      },
    },
  },
});