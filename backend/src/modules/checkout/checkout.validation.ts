import { z } from 'zod';

export const checkoutSubmitSchema = z.object({
  body: z.object({
    storeId: z.string(),
    customerEmail: z.string().email(),
    items: z.array(z.object({
      variantId: z.string(),
      title: z.string(),
      quantity: z.number().int().min(1),
      priceCents: z.number().int().min(0)
    }))
  })
});
