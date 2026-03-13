/**
 * Isometric coordinate transformation utilities for PixiJS/WebGPU environments.
 * Assumes a standard diamond isometric projection where:
 * - Screen X increases right-down
 * - Screen Y increases right-up (or standard screen space)
 * - Tile width (TW) is 2x tile height (TH)
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Converts isometric tile coordinates (grid) to screen space coordinates.
 * @param gridX - The X coordinate on the isometric grid
 * @param gridY - The Y coordinate on the isometric grid
 * @param tileWidth - The width of a single tile
 * @param tileHeight - The height of a single tile
 */
export function gridToScreen(
  gridX: number,
  gridY: number,
  tileWidth: number,
  tileHeight: number,
): Point {
  const x = (gridX - gridY) * (tileWidth / 2);
  const y = (gridX + gridY) * (tileHeight / 2);
  return { x, y };
}

/**
 * Converts screen space coordinates to isometric tile coordinates.
 * Uses inverse matrix transformation.
 * @param screenX - The X coordinate on the screen
 * @param screenY - The Y coordinate on the screen
 * @param tileWidth - The width of a single tile
 * @param tileHeight - The height of a single tile
 */
export function screenToGrid(
  screenX: number,
  screenY: number,
  tileWidth: number,
  tileHeight: number,
): Point {
  const halfTW = tileWidth / 2;
  const halfTH = tileHeight / 2;

  const gridX = (screenX / halfTW + screenY / halfTH) / 2;
  const gridY = (screenY / halfTH - screenX / halfTW) / 2;

  return { x: gridX, y: gridY };
}

/**
 * Converts screen space coordinates to integer-based grid indices.
 * Useful for mouse picking or tile selection.
 */
export function screenToGridIndex(
  screenX: number,
  screenY: number,
  tileWidth: number,
  tileHeight: number,
): Point {
  const pos = screenToGrid(screenX, screenY, tileWidth, tileHeight);
  return {
    x: Math.floor(pos.x),
    y: Math.floor(pos.y),
  };
}