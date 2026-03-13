/**
 * Interface representing the state of a potential move.
 */
export interface MoveEvaluationContext {
  dealtDamage: number;
  expectedIncomingDamage: number;
  weight: number;
}

/**
 * Interface for the result of a damage delta evaluation.
 */
export interface DamageDeltaResult {
  score: number;
  isViable: boolean;
}

/**
 * Evaluates the 'Damage Delta' of a move.
 * Delta = (Dealt Damage - Expected Incoming Damage) * Weight.
 * 
 * @param context The context containing move statistics.
 * @returns The calculated score and viability status.
 */
export function evaluateDamageDelta(context: MoveEvaluationContext): DamageDeltaResult {
  const { dealtDamage, expectedIncomingDamage, weight } = context;

  // Validate inputs to ensure no NaN or infinite values enter the scoring engine
  const safeDealt = Number.isFinite(dealtDamage) ? Math.max(0, dealtDamage) : 0;
  const safeIncoming = Number.isFinite(expectedIncomingDamage) ? Math.max(0, expectedIncomingDamage) : 0;
  const safeWeight = Number.isFinite(weight) ? weight : 1;

  const delta = (safeDealt - safeIncoming) * safeWeight;

  return {
    score: delta,
    isViable: delta > 0,
  };
}