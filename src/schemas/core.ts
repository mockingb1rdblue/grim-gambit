import { z } from 'zod';

/**
 * Faction Schema
 */
export const FactionSchema = z.enum(['TERRAN', 'VOID', 'SYNTH']);
export type Faction = z.infer<typeof FactionSchema>;

/**
 * Weapon Schema
 */
export const WeaponSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  damage: z.number().int().positive(),
  range: z.number().positive(),
  type: z.enum(['BALLISTIC', 'ENERGY', 'MELEE']),
});
export type Weapon = z.infer<typeof WeaponSchema>;

/**
 * Operative Schema
 */
export const OperativeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  faction: FactionSchema,
  health: z.number().int().nonnegative(),
  maxHealth: z.number().int().positive(),
  weapon: WeaponSchema.optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});
export type Operative = z.infer<typeof OperativeSchema>;

/**
 * Validates an unknown object as an Operative.
 * Used at network/IO boundaries.
 */
export function parseOperative(data: unknown): Operative {
  return OperativeSchema.parse(data);
}

/**
 * Validates an unknown object as a Weapon.
 */
export function parseWeapon(data: unknown): Weapon {
  return WeaponSchema.parse(data);
}