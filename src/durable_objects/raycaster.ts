/**
 * Core ray-casting implementation for visibility checks.
 * Determines if a path between two points is blocked by terrain or obstacles.
 */

export interface Point {
  x: number;
  y: number;
  z: number;
}

export interface TerrainMap {
  getHeight: (x: number, y: number) => number;
  isObstructed: (x: number, y: number) => boolean;
}

/**
 * Calculates visibility between two points using a 3D parametric line equation.
 * P(t) = A + t * (B - A), where t is in [0, 1].
 */
export function isVisible(
  start: Point,
  end: Point,
  map: TerrainMap,
  steps: number = 20
): boolean {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dz = end.z - start.z;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = start.x + t * dx;
    const py = start.y + t * dy;
    const pz = start.z + t * dz;

    // Check terrain obstruction
    if (map.isObstructed(px, py)) {
      return false;
    }

    // Check height collision
    const groundHeight = map.getHeight(px, py);
    if (pz < groundHeight) {
      return false;
    }
  }

  return true;
}

/**
 * Durable Object state interface for Raycasting service.
 */
export interface RaycasterState {
  mapData: TerrainMap;
}