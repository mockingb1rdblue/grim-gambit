/**
 * Interfaces for Tiled JSON export schema.
 */
export interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
  tilesets: TiledTileset[];
}

export interface TiledLayer {
  type: 'tilelayer' | 'objectgroup';
  name: string;
  data?: number[];
  width?: number;
  height?: number;
  visible: boolean;
  opacity: number;
}

export interface TiledTileset {
  firstgid: number;
  source?: string;
  image?: string;
  tilewidth: number;
  tileheight: number;
}

/** Parses Tiled JSON data into a typed structure. */
export function parseTiledMap(json: unknown): TiledMap {
  if (typeof json !== 'object' || json === null) {
    throw new Error('Invalid Tiled JSON: Expected object');
  }

  const map = json as Record<string, unknown>;
  
  return {
    width: map.width as number,
    height: map.height as number,
    tilewidth: map.tilewidth as number,
    tileheight: map.tileheight as number,
    layers: map.layers as TiledLayer[],
    tilesets: map.tilesets as TiledTileset[],
  };
}