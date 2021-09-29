import { z } from "zod";

export const Card = z.object({
  name: z.string(),
  id: z.string(),
  imageUrl: z.string().optional(),
});

export const Database = z.object({
  positions: z.record(
    z.object({
      card: Card,
    }),
  ),
});

export const LichessMove = z.object({
  san: z.string(),
  white: z.number(),
  draws: z.number(),
  black: z.number(),
  averageRating: z.number(),
});

export const LichessExplorerResult = z.object({
  white: z.number(),
  draws: z.number(),
  black: z.number(),
  averageRating: z.number(),
  opening: z
    .object({
      eco: z.string(),
      name: z.string(),
    })
    .nullable(),
  moves: z.array(LichessMove),
});

export const LichessCloudEvalResult = z.object({
  fen: z.string(),
  knodes: z.number(),
  depth: z.number(),
  pvs: z.array(
    z.object({
      moves: z.string(),
      cp: z.number(),
    }),
  ),
});

export type TDatabase = z.infer<typeof Database>;
export type TCard = z.infer<typeof Card>;
export type TLichessExplorerResult = z.infer<typeof LichessExplorerResult>;
