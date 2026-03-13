import { Point } from 'pixi.js';

/**
 * Isometric projection utility for 2D grid systems.
 * Assumes a standard diamond-shaped isometric grid where:
 * - X-axis is at +30 degrees
 * - Y-axis is at -30 degrees
 * - Tile width = 2 * Tile height
 */
export class IsometricEngine {
  private readonly tileWidth: number;
  private readonly tileHeight: number;

  /**
   * @param tileWidth Width of the isometric tile in pixels.
   * @param tileHeight Height of the isometric tile in pixels.
   */
  constructor(tileWidth: number, tileHeight: number) {
    if (tileWidth <= 0 || tileHeight <= 0) {
      throw new Error("Tile dimensions must be positive values.");
    }
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
  }

  /**
   * Converts grid coordinates (cartesian) to screen-space coordinates.
   * @param gridX The grid X position.
   * @param gridY The grid Y position.
   * @returns A Point object representing screen coordinates.
   */
  public gridToScreen(gridX: number, gridY: number): Point {
    const x = (gridX - gridY) * (this.tileWidth / 2);
    const y = (gridX + gridY) * (this.tileHeight / 2);
    return new Point(x, y);
  }

  /**
   * Converts screen-space coordinates to grid coordinates.
   * @param screenX The screen X position.
   * @param screenY The screen Y position.
   * @returns A Point object representing grid coordinates.
   */
  public screenToGrid(screenX: number, screenY: number): Point {
    const halfW = this.tileWidth / 2;
    const halfH = this.tileHeight / 2;

    // Inverse of the transformation matrix
    const gridX = (screenX / halfW + screenY / halfH) / 2;
    const gridY = (screenY / halfH - screenX / halfW) / 2;

    return new Point(gridX, gridY);
  }

  /**
   * Projects a global mouse coordinate into local isometric space
   * relative to a PixiJS DisplayObject's transform.
   * 
   * @param globalPoint The mouse position from the interaction event.
   * @param container The PixiJS container/object that holds the grid.
   * @returns Grid coordinates.
   */
  public globalToGrid(globalPoint: Point, container: { toLocal: (p: Point) => Point }): Point {
    if (!globalPoint || !container || typeof container.toLocal !== 'function') {
      return new Point(0, 0);
    }

    const localPoint = container.toLocal(globalPoint);
    return this.screenToGrid(localPoint.x, localPoint.y);
  }
}