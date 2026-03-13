import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { StateFrom } from 'xstate';

/**
 * Represents the synchronized state of the XState machine.
 */
export interface SyncState {
  status: string;
  context: Record<string, unknown>;
  lastUpdated: number;
}

interface SyncStore extends SyncState {
  updateState: (newState: Partial<SyncState>) => void;
}

/**
 * Zustand store to bridge XState machine transitions to the React HUD.
 * Uses subscribeWithSelector to allow fine-grained component updates.
 */
export const useSyncStore = create<SyncStore>()(
  subscribeWithSelector((set) => ({
    status: 'idle',
    context: {},
    lastUpdated: Date.now(),
    updateState: (newState) =>
      set((state) => ({
        ...state,
        ...newState,
        lastUpdated: Date.now(),
      })),
  }))
);

/**
 * Helper to sync an XState snapshot into the Zustand store.
 * @param snapshot The XState snapshot from the interpreter.
 */
export function syncXStateToStore(snapshot: { value: unknown; context: unknown }): void {
  const status = typeof snapshot.value === 'string' ? snapshot.value : JSON.stringify(snapshot.value);
  
  useSyncStore.getState().updateState({
    status,
    context: snapshot.context as Record<string, unknown>,
  });
}