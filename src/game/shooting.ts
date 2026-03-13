/**
 * Core types for shooting resolution.
 */
export interface WeaponProfile {
  attacks: number;
  hitThreshold: number;
  lethalThreshold?: number;
  relentless: boolean;
}

export interface TargetProfile {
  saveThreshold: number;
  wounds: number;
}

export interface ShootingResult {
  hits: number;
  woundsInflicted: number;
  damageTaken: number;
}

/**
 * Rolls a D6.
 */
function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Resolves a shooting attack sequence.
 * 
 * Rules:
 * - Hit: Roll >= hitThreshold.
 * - Lethal: If roll >= lethalThreshold, it's an automatic wound.
 * - Relentless: Re-roll 1s on hit rolls.
 */
export function resolveShooting(
  weapon: WeaponProfile,
  target: TargetProfile,
  damagePerHit: number
): ShootingResult {
  let hits = 0;
  let woundsInflicted = 0;

  for (let i = 0; i < weapon.attacks; i++) {
    let hitRoll = rollD6();

    // Relentless: re-roll 1s
    if (weapon.relentless && hitRoll === 1) {
      hitRoll = rollD6();
    }

    if (hitRoll >= weapon.hitThreshold) {
      hits++;
      
      // Lethal rule: check for auto-wound
      if (weapon.lethalThreshold !== undefined && hitRoll >= weapon.lethalThreshold) {
        woundsInflicted++;
      } else {
        // Standard save roll
        const saveRoll = rollD6();
        if (saveRoll < target.saveThreshold) {
          woundsInflicted++;
        }
      }
    }
  }

  return {
    hits,
    woundsInflicted,
    damageTaken: woundsInflicted * damagePerHit
  };
}