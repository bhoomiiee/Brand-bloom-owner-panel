import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    basePriceCents: z.number().int().min(0),
    description: z.string().optional()
  })
});
