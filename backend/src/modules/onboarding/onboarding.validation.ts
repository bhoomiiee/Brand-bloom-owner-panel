import { z } from 'zod';

export const saveDraftSchema = z.object({
  body: z.object({
    storeName: z.string().optional(),
    step: z.number().min(1).max(5).optional()
  })
});
