import { z } from 'zod';

export const UnitSchema = z.object({
  id: z.string(),
  name: z.string(),
  points: z.number().int().nonnegative(),
});

export const FactionSchema = z.object({
  id: z.string(),
  name: z.string(),
  units: z.array(UnitSchema),
  maxPoints: z.number().int().positive(),
});

export type Unit = z.infer<typeof UnitSchema>;
export type Faction = z.infer<typeof FactionSchema>;

export const INTERCESSION_SQUAD: Faction = {
  id: 'intercession-squad',
  name: 'Intercession Squad',
  maxPoints: 1000,
  units: [
    { id: 'intercessor', name: 'Intercessor', points: 100 },
    { id: 'assault-intercessor', name: 'Assault Intercessor', points: 100 },
  ],
};

export const LEGIONARIES: Faction = {
  id: 'legionaries',
  name: 'Legionaries',
  maxPoints: 1000,
  units: [
    { id: 'legionary', name: 'Legionary', points: 120 },
    { id: 'chosen', name: 'Chosen', points: 150 },
  ],
};