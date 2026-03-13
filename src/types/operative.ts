import { z } from 'zod';

export const StatSchema = z.object({
  health: z.number().int().min(0),
  stamina: z.number().int().min(0),
  accuracy: z.number().min(0).max(100),
  evasion: z.number().min(0).max(100),
});

export const WeaponSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  damage: z.number().int().positive(),
  range: z.number().positive(),
  ammoCapacity: z.number().int().positive(),
  currentAmmo: z.number().int().min(0),
  type: z.enum(['PISTOL', 'RIFLE', 'SNIPER', 'MELEE']),
});

export const StatusEffectSchema = z.object({
  id: z.string(),
  name: z.string(),
  durationTurns: z.number().int().min(0),
  modifier: z.record(z.string(), z.number()).optional(),
});

export const OperativeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  stats: StatSchema,
  equipment: z.object({
    primaryWeapon: WeaponSchema.nullable(),
    secondaryWeapon: WeaponSchema.nullable(),
    armor: z.string().nullable(),
  }),
  statusEffects: z.array(StatusEffectSchema),
  position: z.object({
    x: z.number().int(),
    y: z.number().int(),
  }),
});

export type Stat = z.infer<typeof StatSchema>;
export type Weapon = z.infer<typeof WeaponSchema>;
export type StatusEffect = z.infer<typeof StatusEffectSchema>;
export type Operative = z.infer<typeof OperativeSchema>;