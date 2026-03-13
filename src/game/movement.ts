/**
 * Core movement validation logic.
 * Rules: 1 tile = 5 feet = 1 inch.
 * Rounding: Standard tabletop rounding (round half up).
 */

export interface Position {
  x: number;
  y: number;
}

export interface MovementConfig {
  speed: number;
  dashMultiplier: number;
  chargeDistance: number;
}

/** Converts tiles to inches. */
export function tilesToInches(tiles: number): number {
  return Math.round(tiles);
}

/** Calculates Euclidean distance between two points in tiles. */
export function getDistance(start: Position, end: Position): number {
  return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
}

/** Validates standard reposition movement. */
export function validateReposition(
  start: Position,
  end: Position,
  speed: number
): boolean {
  const distance = getDistance(start, end);
  return distance <= speed;
}

/** Validates dash movement. */
export function validateDash(
  start: Position,
  end: Position,
  speed: number,
  multiplier: number = 2
): boolean {
  const distance = getDistance(start, end);
  return distance <= speed * multiplier;
}

/** Validates charge movement (straight line, fixed distance). */
export function validateCharge(
  start: Position,
  end: Position,
  chargeDistance: number
): boolean {
  const distance = getDistance(start, end);
  
  // Charge must be a straight line (axial or diagonal only)
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  
  const isStraight = dx === 0 || dy === 0 || dx === dy;
  
  return isStraight && distance <= chargeDistance;
}