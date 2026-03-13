import { TiledMap, parseTiledProperties, TileMetadata } from './tiled-parser';

/**
 * Represents the processed Asset Pipeline output for PixiJS
 */
export interface AssetPipelineResult {
  texturePath: string;
  tileMetadata: Map<number, TileMetadata>;
}

/**
 * Orchestrates the conversion of Tiled JSON to PixiJS-compatible assets.
 */
export function processTiledMap(rawJson: unknown, texturePath: string): AssetPipelineResult {
  if (!isTiledMap(rawJson)) {
    throw new Error('Invalid Tiled JSON structure');
  }

  const tileMetadata = parseTiledProperties(rawJson);

  return {
    texturePath,
    tileMetadata,
  };
}

/**
 * Type guard for TiledMap
 */
function isTiledMap(data: unknown): data is TiledMap {
  return (
    typeof data === 'object' &&
    data !== null &&
    'layers' in data &&
    Array.isArray((data as TiledMap).layers)
  );
}