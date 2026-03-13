import { z } from 'zod';
import { 
  type PlayerState, 
  type StrongholdUpgrade, 
  StrongholdUpgradeSchema 
} from '../types/stronghold';

export class UpgradeValidationError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'UpgradeValidationError';
  }
}

/**
 * Validates if a player can perform a stronghold upgrade based on 
 * prerequisites and resource availability.
 */
export function validateStrongholdUpgrade(
  player: PlayerState,
  upgradeData: unknown
): { success: true } | { success: false; error: string } {
  const result = StrongholdUpgradeSchema.safeParse(upgradeData);

  if (!result.success) {
    return { success: false, error: 'Invalid upgrade data schema' };
  }

  const upgrade = result.data;

  // 1. Level progression check
  if (upgrade.targetLevel !== player.currentLevel + 1) {
    return { success: false, error: 'Target level must be exactly one higher than current level' };
  }

  // 2. Battle Honours check
  if (player.battleHonours < upgrade.requiredHonours) {
    return { success: false, error: 'Insufficient Battle Honours' };
  }

  // 3. Resource check
  if (player.resources.gold < upgrade.cost.gold) {
    return { success: false, error: 'Insufficient gold' };
  }
  if (player.resources.wood < upgrade.cost.wood) {
    return { success: false, error: 'Insufficient wood' };
  }
  if (player.resources.stone < upgrade.cost.stone) {
    return { success: false, error: 'Insufficient stone' };
  }

  return { success: true };
}