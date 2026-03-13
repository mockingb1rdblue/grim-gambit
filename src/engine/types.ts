export interface Point {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  position: Point;
  health: number;
}

export interface GameState {
  entities: Entity[];
  turn: number;
  phase: 'idle' | 'planning' | 'executing';
}

export type GameEvent =
  | { type: 'START_PLANNING' }
  | { type: 'SUBMIT_ACTIONS' }
  | { type: 'RESOLVE_TURN' };