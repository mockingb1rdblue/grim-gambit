/**
 * Constants for hexagonal grid calculations.
 * Assuming a standard flat-top hex grid.
 */
const HEX_SIZE_INCHES = 1.0;
const SQRT_3 = Math.sqrt(3);

export interface Vector2D {
  x: number;
  y: number;
}

export interface HexCoordinate {
  q: number;
  r: number;
}

/**
 * Converts axial hex coordinates (q, r) to Cartesian inch coordinates (x, y).
 */
export function hexToInch(hex: HexCoordinate): Vector2D {
  const x = HEX_SIZE_INCHES * (3 / 2 * hex.q);
  const y = HEX_SIZE_INCHES * (SQRT_3 / 2 * hex.q + SQRT_3 * hex.r);
  return { x, y };
}

/**
 * Calculates the hex distance between two coordinates.
 */
export function getHexDistance(a: HexCoordinate, b: HexCoordinate): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}