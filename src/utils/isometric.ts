/**
 * Isometric coordinate transformation utilities.
 * Assumes a standard diamond-shaped isometric projection.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Converts 3D isometric grid coordinates to 2D screen coordinates.
 * @param gridX The x coordinate on the grid.
 * @param gridY The y coordinate on the grid.
 * @param tileWidth The width of a single tile in pixels.
 * @param tileHeight The height of a single tile in pixels.
 * @returns The 2D screen position.
 */
export function isometricToScreen(
  gridX: number,
  gridY: number,
  tileWidth: number,
  tileHeight: number
): Point2D {
  return {
    x: (gridX - gridY) * (tileWidth / 2),
    y: (gridX + gridY) * (tileHeight / 2),
  };
}

/**
 * Converts 2D screen coordinates to 3D isometric grid coordinates.
 * Note: Z is assumed to be 0 for flat grid operations.
 * @param screenX The x coordinate on the screen.
 * @param screenY The y coordinate on the screen.
 * @param tileWidth The width of a single tile in pixels.
 * @param tileHeight The height of a single tile in pixels.
 * @returns The 3D grid position (z is defaulted to 0).
 */
export function screenToIsometric(
  screenX: number,
  screenY: number,
  tileWidth: number,
  tileHeight: number
): Point3D {
  const gridX = (screenX / (tileWidth / 2) + screenY / (tileHeight / 2)) / 2;
  const gridY = (screenY / (tileHeight / 2) - screenX / (tileWidth / 2)) / 2;

  return {
    x: gridX,
    y: gridY,
    z: 0,
  };
}