export interface Position {
  x: number;
  y: number;
}

export interface Tile {
  id: string;
  impassable: boolean;
}

export interface TerrainMap {
  getTile(pos: Position): Tile | undefined;
}

export interface LOSResult {
  blocked: boolean;
  blockerPosition?: Position;
}