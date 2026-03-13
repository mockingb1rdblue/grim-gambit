import { z } from 'zod';

export const PositionSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
});

export type Position = z.infer<typeof PositionSchema>;

export const EntitySchema = z.object({
  id: z.string().uuid(),
  position: PositionSchema,
  health: z.number().min(0),
  team: z.enum(['player', 'enemy']),
});

export type Entity = z.infer<typeof EntitySchema>;

export const GameStateSchema = z.object({
  entities: z.array(EntitySchema),
  turn: z.enum(['player', 'enemy']),
  phase: z.enum(['idle', 'moving', 'attacking']),
});

export type GameState = z.infer<typeof GameStateSchema>;