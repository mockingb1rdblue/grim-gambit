/**
 * AI Controller responsible for balancing combat and objective-based decision making.
 */

export interface Objective {
  id: string;
  position: { x: number; y: number };
  scoreValue: number;
}

export interface Enemy {
  id: string;
  position: { x: number; y: number };
  threatLevel: number;
}

export interface AIState {
  position: { x: number; y: number };
  objectives: Objective[];
  enemies: Enemy[];
}

/**
 * Calculates the weight of an objective based on distance and value.
 */
export function calculateObjectiveWeight(
  aiPosition: { x: number; y: number },
  objective: Objective,
  proximityFactor: number
): number {
  const dx = objective.position.x - aiPosition.x;
  const dy = objective.position.y - aiPosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Inverse distance weighting with a proximity factor to prioritize closer objectives
  return objective.scoreValue / (1 + distance * proximityFactor);
}

/**
 * Determines the next target destination based on objective proximity and enemy threat.
 */
export function selectBestTarget(
  state: AIState,
  combatWeight: number,
  objectiveWeight: number
): { type: 'objective' | 'enemy'; id: string } | null {
  if (state.objectives.length === 0 && state.enemies.length === 0) {
    return null;
  }

  let bestScore = -Infinity;
  let bestTarget: { type: 'objective' | 'enemy'; id: string } | null = null;

  // Evaluate Objectives
  for (const obj of state.objectives) {
    const score = calculateObjectiveWeight(state.position, obj, 0.1) * objectiveWeight;
    if (score > bestScore) {
      bestScore = score;
      bestTarget = { type: 'objective', id: obj.id };
    }
  }

  // Evaluate Enemies
  for (const enemy of state.enemies) {
    const dx = enemy.position.x - state.position.x;
    const dy = enemy.position.y - state.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Combat score: Higher threat and closer distance increase priority
    const score = (enemy.threatLevel / (1 + distance)) * combatWeight;
    
    if (score > bestScore) {
      bestScore = score;
      bestTarget = { type: 'enemy', id: enemy.id };
    }
  }

  return bestTarget;
}