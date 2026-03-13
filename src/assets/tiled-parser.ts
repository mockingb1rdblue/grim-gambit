/**
 * Types for Tiled JSON Export
 */
export interface TiledProperty {
  name: string;
  type: string;
  value: unknown;
}

export interface TiledLayer {
  name: string;
  type: string;
  data?: number[];
  objects?: TiledObject[];
  properties?: TiledProperty[];
}

export interface TiledObject {
  id: number;
  name: string;
  properties?: TiledProperty[];
}

export interface TiledMap {
  layers: TiledLayer[];
  tilewidth: number;
  tileheight: number;
}

/**
 * Internal Game Tile State
 */
export interface TileMetadata {
  cover: boolean;
  elevation: number;
}

/**
 * Parses Tiled JSON data into a map of TileMetadata based on custom properties.
 */
export function parseTiledProperties(map: TiledMap): Map<number, TileMetadata> {
  const metadataMap = new Map<number, TileMetadata>();

  for (const layer of map.layers) {
    if (layer.properties) {
      const metadata: TileMetadata = {
        cover: false,
        elevation: 0,
      };

      for (const prop of layer.properties) {
        if (prop.name === 'cover' && typeof prop.value === 'boolean') {
          metadata.cover = prop.value;
        }
        if (prop.name === 'elevation' && typeof prop.value === 'number') {
          metadata.elevation = prop.value;
        }
      }

      // Map layers typically map to tile IDs or GIDs
      // In this context, we associate the metadata with the layer index or ID
      // assuming a flat mapping for simplicity in this pipeline
      metadataMap.set(layer.data?.[0] ?? 0, metadata);
    }
  }

  return metadataMap;
}