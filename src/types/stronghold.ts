import { z } from 'zod';

export const ResourceCostSchema = z.object({
  gold: z.number().int().nonnegative(),
  wood: z.number().int().nonnegative(),
  stone: z.number().int().nonnegative(),
});

export type ResourceCost = z.infer<typeof ResourceCostSchema>;

export const StrongholdUpgradeSchema = z.object({
  targetLevel: z.number().int().positive(),
  requiredHonours: z.number().int().nonnegative(),
  cost: ResourceCostSchema,
});

export type StrongholdUpgrade = z.infer<typeof StrongholdUpgradeSchema>;

export interface PlayerState {
  currentLevel: number;
  battleHonours: number;
  resources: ResourceCost;
}