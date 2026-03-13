import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface GameState {
  players: Record<string, { x: number; y: number; id: string }>;
  score: number;
}

interface GameActions {
  updatePlayer: (id: string, position: { x: number; y: number }) => void;
  setScore: (score: number) => void;
  syncState: (state: GameState) => void;
}

export const useGameStore = create<GameState & GameActions>()(
  subscribeWithSelector((set) => ({
    players: {},
    score: 0,
    updatePlayer: (id, position) =>
      set((state) => ({
        players: { ...state.players, [id]: { ...position, id } },
      })),
    setScore: (score) => set({ score }),
    syncState: (state) => set(state),
  }))
);