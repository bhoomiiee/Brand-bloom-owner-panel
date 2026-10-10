import { z } from 'zod';

export const paymentInitiateSchema = z.object({
  body: z.object({
    orderId: z.string(),
    amountCents: z.number().int().min(1)
  })
});
