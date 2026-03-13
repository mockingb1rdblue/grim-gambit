/**
 * Shared types for the operative state machine and game engine integration.
 */
export interface GameStateUpdate {
  operativeId: string;
  state: 'idle' | 'move' | 'shoot';
  position: { x: number; y: number };
}