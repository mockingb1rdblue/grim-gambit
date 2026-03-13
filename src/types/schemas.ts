import { z } from "zod";

/**
 * Operative Stat Schema
 * APL: Action Point Limit
 * GA: Group Activation
 * DF: Defense
 */
export const OperativeStatsSchema = z.object({
  apl: z.number().int().min(1),
  ga: z.number().int().min(1),
  df: z.number().int().min(1),
  wounds: z.number().int().min(1),
  save: z.number().int().min(2).max(6),
});

export type OperativeStats = z.infer<typeof OperativeStatsSchema>;

/**
 * Weapon Profile Schema
 * A: Attacks
 * BS: Ballistic Skill / WS: Weapon Skill
 * D: Damage (Critical/Normal)
 */
export const WeaponProfileSchema = z.object({
  name: z.string(),
  attacks: z.number().int().min(1),
  skill: z.number().int().min(2).max(6),
  damage: z.object({
    normal: z.number().int().min(1),
    critical: z.number().int().min(1),
  }),
  specialRules: z.array(z.string()),
});

export type WeaponProfile = z.infer<typeof WeaponProfileSchema>;