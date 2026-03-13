/**
 * Tiled JSON schema definitions and parser logic.
 */

export interface TiledLayer {
  name: string;
  type: "tilelayer" | "objectgroup";
  data?: number[];
  objects?: TiledObject[];
  visible: boolean;
  opacity: number;
  x: number;
  y: number;
}

export interface TiledObject {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: { name: string; value: unknown }[];
}

export interface TiledJSON {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
  orientation: "orthogonal" | "isometric";
}

/** Parses Tiled JSON and validates structure */
export function parseTiledJSON(json: unknown): TiledJSON {
  if (typeof json !== "object" || json === null) {
    throw new Error("Invalid Tiled JSON: root is not an object");
  }

  const data = json as Record<string, unknown>;

  if (typeof data.width !== "number" || typeof data.height !== "number") {
    throw new Error("Invalid Tiled JSON: missing dimensions");
  }

  return json as TiledJSON;
}