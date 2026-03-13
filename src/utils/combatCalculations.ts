/**
 * Utility functions for combat pre-calculation.
 * These are used by the HUD to visualize potential outcomes.
 */

export interface OperativeStats {
  accuracy: number;
  criticalChance: number;
  baseDamage: number;
  criticalMultiplier: number;
}

export interface TargetStats {
  evasion: number;
  armor: number;
}

export interface CombatPreview {
  hitProbability: number;
  expectedDamage: number;
  criticalProbability: number;
}

/**
 * Calculates the probability of a successful hit.
 * Base accuracy is modified by target evasion.
 */
export function calculateHitProbability(operative: OperativeStats, target: TargetStats): number {
  const rawProbability = operative.accuracy - target.evasion;
  return Math.max(0.05, Math.min(1.0, rawProbability));
}

/**
 * Calculates the expected damage of an action, accounting for hit chance and critical hits.
 */
export function calculateExpectedDamage(operative: OperativeStats, target: TargetStats): number {
  const hitChance = calculateHitProbability(operative, target);
  
  // Average damage per hit = (Non-crit damage * (1 - critChance)) + (Crit damage * critChance)
  const critDamage = operative.baseDamage * operative.criticalMultiplier;
  const avgDamagePerHit = (operative.baseDamage * (1 - operative.criticalChance)) + 
                          (critDamage * operative.criticalChance);
  
  const mitigatedDamage = Math.max(0, avgDamagePerHit - target.armor);
  
  return hitChance * mitigatedDamage;
}

/**
 * Returns a summary of combat outcomes for UI preview bars.
 */
export function getCombatPreview(operative: OperativeStats, target: TargetStats): CombatPreview {
  return {
    hitProbability: calculateHitProbability(operative, target),
    expectedDamage: calculateExpectedDamage(operative, target),
    criticalProbability: operative.criticalChance,
  };
}