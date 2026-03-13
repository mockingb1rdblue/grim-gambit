export interface Action {
  id: string;
  type: 'attack' | 'move' | 'defend';
  damagePotential?: number;
  coverBonus?: number;
  distanceToObjective?: number;
}

export interface Weights {
  damageWeight: number;
  coverWeight: number;
  objectiveWeight: number;
}

/**
 * Evaluates actions based on utility weights and selects the best one.
 */
export function evaluateActions(actions: Action[], weights: Weights): Action | null {
  if (actions.length === 0) {
    return null;
  }

  let bestAction: Action | null = null;
  let maxScore = -Infinity;

  for (const action of actions) {
    const score = calculateUtility(action, weights);
    if (score > maxScore) {
      maxScore = score;
      bestAction = action;
    }
  }

  return bestAction;
}

/**
 * Calculates the utility score for a single action based on weighted factors.
 */
function calculateUtility(action: Action, weights: Weights): number {
  const damage = action.damagePotential ?? 0;
  const cover = action.coverBonus ?? 0;
  // Inverse distance: closer to objective (smaller number) yields higher score
  const objective = action.distanceToObjective !== undefined ? 1 / (1 + action.distanceToObjective) : 0;

  return (
    damage * weights.damageWeight +
    cover * weights.coverWeight +
    objective * weights.objectiveWeight
  );
}