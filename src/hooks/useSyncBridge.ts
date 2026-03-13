import { useEffect } from 'react';
import { useSyncStore, syncXStateToStore } from '../store/sync';
import type { ActorRef } from 'xstate';

/**
 * Hook to connect an XState actor to the Zustand sync store.
 * Ensures the HUD reacts to machine transitions immediately.
 */
export function useSyncBridge(actor: ActorRef<any>): void {
  useEffect(() => {
    const subscription = actor.subscribe((snapshot) => {
      syncXStateToStore({
        value: snapshot.value,
        context: snapshot.context,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [actor]);
}

/**
 * Hook to select specific state from the HUD sync store.
 */
export function useHUDState<T>(selector: (state: ReturnType<typeof useSyncStore.getState>) => T): T {
  return useSyncStore(selector);
}