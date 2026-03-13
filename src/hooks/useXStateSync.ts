import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ActorRef, SnapshotFrom } from 'xstate';

/**
 * Syncs a slice of the XState machine's state into the Zustand store.
 * 
 * @param actor - The XState actor reference (e.g., from useActor)
 * @param selector - Function to extract the relevant slice from the machine snapshot
 * @param syncFn - Function to update the Zustand store with the extracted state
 */
export function useXStateSync<TState, TSlice>(
  actor: ActorRef<any, TState>,
  selector: (snapshot: TState) => TSlice,
  syncFn: (slice: TSlice) => void
): void {
  useEffect(() => {
    const subscription = actor.subscribe((snapshot) => {
      const slice = selector(snapshot);
      syncFn(slice);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [actor, selector, syncFn]);
}