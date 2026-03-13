import { evaluateDamageDelta, MoveEvaluationContext, DamageDeltaResult } from './damage-delta-evaluator';

/**
 * Stateless worker handler for Damage Delta evaluation.
 * Expects a serialized MoveEvaluationContext and returns a DamageDeltaResult.
 */
export function handleDamageDeltaWorker(payload: unknown): DamageDeltaResult {
  if (!isMoveEvaluationContext(payload)) {
    throw new Error('Invalid payload: expected MoveEvaluationContext');
  }

  return evaluateDamageDelta(payload);
}

/**
 * Type guard for MoveEvaluationContext.
 */
function isMoveEvaluationContext(value: unknown): value is MoveEvaluationContext {
  return (
    typeof value === 'object' &&
    value !== null &&
    'dealtDamage' in value &&
    'expectedIncomingDamage' in value &&
    'weight' in value &&
    typeof (value as MoveEvaluationContext).dealtDamage === 'number' &&
    typeof (value as MoveEvaluationContext).expectedIncomingDamage === 'number' &&
    typeof (value as MoveEvaluationContext).weight === 'number'
  );
}