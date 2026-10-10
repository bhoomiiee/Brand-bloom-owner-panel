import { z } from 'zod';

export const productSchema = z.object({
  title: z.string().min(1),
  basePriceCents: z.number().int().min(0)
});
