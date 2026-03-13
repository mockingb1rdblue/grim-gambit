import { z } from 'zod';

export const IntercessionSquadSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  members: z.number().int().positive(),
  specialization: z.enum(['Assault', 'Intercessor', 'Hellblaster']),
});

export const LegionarySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  rank: z.string(),
  isVeteran: z.boolean(),
});

export type IntercessionSquad = z.infer<typeof IntercessionSquadSchema>;
export type Legionary = z.infer<typeof LegionarySchema>;

export const FactionRegistrySchema = z.object({
  squads: z.array(IntercessionSquadSchema),
  legionaries: z.array(LegionarySchema),
});

export type FactionRegistryData = z.infer<typeof FactionRegistrySchema>;