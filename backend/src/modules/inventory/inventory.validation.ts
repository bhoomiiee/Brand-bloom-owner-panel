import { z } from 'zod';

export const adjustStockSchema = z.object({
  body: z.object({
    variantId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    delta: z.number().int(),
    reason: z.string().min(2)
  })
});
