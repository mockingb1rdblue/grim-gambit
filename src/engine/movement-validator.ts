import { Position, TerrainMap, LOSResult } from '../types/world';

export interface MovementAction {
  type: 'DASH' | 'CHARGE' | 'FALL_BACK';
  start: Position;
  target: Position;
}

/**
 * Validates movement actions against terrain constraints.
 * Uses LOS engine to ensure paths are clear.
 */
export class MovementValidator {
  constructor(private terrain: TerrainMap) {}

  /**
   * Validates if a movement action is legal.
   * Ensures the path is not blocked by impassable terrain.
   */
  public validate(action: MovementAction): boolean {
    const path = this.calculatePath(action.start, action.target);
    
    for (const point of path) {
      if (!this.isTraversable(point)) {
        return false;
      }
    }
    
    return true;
  }

  private isTraversable(pos: Position): boolean {
    const tile = this.terrain.getTile(pos);
    return tile !== undefined && !tile.impassable;
  }

  /**
   * Simple linear interpolation for path checking.
   * In a real implementation, this would integrate with the A* or Bresenham LOS engine.
   */
  private calculatePath(start: Position, end: Position): Position[] {
    const path: Position[] = [];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    for (let i = 0; i <= steps; i++) {
      const t = steps === 0 ? 0 : i / steps;
      path.push({
        x: Math.round(start.x + dx * t),
        y: Math.round(start.y + dy * t),
      });
    }
    return path;
  }
}