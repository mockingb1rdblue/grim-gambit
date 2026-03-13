import { z } from "zod";

export const MoveSchema = z.object({
  type: z.literal("MOVE"),
  playerId: z.string(),
  payload: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export type Move = z.infer<typeof MoveSchema>;

export const GameStateSchema = z.object({
  status: z.enum(["WAITING", "PLAYING", "FINISHED"]),
  players: z.array(z.string()),
  history: z.array(MoveSchema),
});

export type GameState = z.infer<typeof GameStateSchema>;