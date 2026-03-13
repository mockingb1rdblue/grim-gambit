import { Point } from './types';

/** Converts isometric grid coordinates to screen space. */
export function gridToScreen(gridX: number, gridY: number, tileSize: number): Point {
  return {
    x: (gridX - gridY) * (tileSize / 2),
    y: (gridX + gridY) * (tileSize / 4),
  };
}

/** Simple distance check for Line of Sight or Range. */
export function getDistance(a: Point, b: Point): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}