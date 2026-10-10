import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    storeId: z.string(),
    variantId: z.string(),
    quantity: z.number().int().min(1),
    priceCents: z.number().int().min(0)
  })
});
