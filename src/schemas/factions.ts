import { z } from 'zod';

/**
 * Base operative schema shared across all factions
 */
const OperativeSchema = z.object({
  id: z.string(),
  name: z.string(),
  m: z.number(),
  apl: z.number(),
  ga: z.number(),
  df: z.number(),
  sv: z.string(),
  w: z.number(),
  keywords: z.array(z.string()),
});

const WeaponSchema = z.object({
  name: z.string(),
  a: z.number(),
  bs: z.string(),
  dmg: z.string(),
  special: z.array(z.string()).optional(),
  crit: z.string().optional(),
});

/**
 * Intercession Squad Schema
 */
export const IntercessionSquadSchema = z.object({
  faction: z.literal('Intercession Squad'),
  operatives: z.array(OperativeSchema.extend({
    weapons: z.array(WeaponSchema),
  })),
});

/**
 * Veteran Guardsmen Schema
 */
export const VeteranGuardsmenSchema = z.object({
  faction: z.literal('Veteran Guardsmen'),
  operatives: z.array(OperativeSchema.extend({
    weapons: z.array(WeaponSchema),
  })),
});

/**
 * Legionary Schema
 */
export const LegionarySchema = z.object({
  faction: z.literal('Legionary'),
  operatives: z.array(OperativeSchema.extend({
    weapons: z.array(WeaponSchema),
  })),
});

/**
 * Union type for all supported faction rosters
 */
export const FactionRosterSchema = z.union([
  IntercessionSquadSchema,
  VeteranGuardsmenSchema,
  LegionarySchema,
]);

export type IntercessionSquad = z.infer<typeof IntercessionSquadSchema>;
export type VeteranGuardsmen = z.infer<typeof VeteranGuardsmenSchema>;
export type Legionary = z.infer<typeof LegionarySchema>;
export type FactionRoster = z.infer<typeof FactionRosterSchema>;