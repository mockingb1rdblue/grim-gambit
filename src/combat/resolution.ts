/**
 * Types representing combat entities and resolution outcomes.
 */
export interface Weapon {
  damage: number;
  lethal?: number;
  piercing?: number;
}

export interface DefensePool {
  evasion: number;
  armor: number;
  shields: number;
}

export interface ResolutionResult {
  damageTaken: number;
  lethalHits: number;
}

/**
 * Resolves combat using optimal defense allocation.
 * Logic:
 * 1. Piercing reduces Armor first.
 * 2. Excess Piercing reduces Shields or Evasion.
 * 3. Lethal keywords trigger if damage > 0 after mitigation.
 */
export function resolveCombat(weapon: Weapon, defense: DefensePool): ResolutionResult {
  let remainingDamage = weapon.damage;
  let piercing = weapon.piercing ?? 0;

  // Apply Piercing to Armor
  const armorMitigation = Math.min(defense.armor, piercing);
  piercing -= armorMitigation;
  let effectiveArmor = defense.armor - armorMitigation;

  // Apply remaining Piercing to Shields
  const shieldMitigation = Math.min(defense.shields, piercing);
  piercing -= shieldMitigation;
  let effectiveShields = defense.shields - shieldMitigation;

  // Apply remaining Piercing to Evasion
  const evasionMitigation = Math.min(defense.evasion, piercing);
  let effectiveEvasion = defense.evasion - evasionMitigation;

  // Standard Mitigation (Non-piercing damage)
  // Optimal order: Shields -> Armor -> Evasion
  const applyDamage = (amount: number, capacity: number): [number, number] => {
    const mitigated = Math.min(amount, capacity);
    return [amount - mitigated, capacity - mitigated];
  };

  let [dmgAfterShields, nextShields] = applyDamage(remainingDamage, effectiveShields);
  let [dmgAfterArmor, _nextArmor] = applyDamage(dmgAfterShields, effectiveArmor);
  let [finalDamage, _nextEvasion] = applyDamage(dmgAfterArmor, effectiveEvasion);

  return {
    damageTaken: finalDamage,
    lethalHits: finalDamage > 0 ? (weapon.lethal ?? 0) : 0,
  };
}