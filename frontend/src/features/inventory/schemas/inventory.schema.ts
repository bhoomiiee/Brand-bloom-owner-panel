import { z } from 'zod';

export const inventoryAdjustmentSchema = z.object({
  delta: z.number().int()
});
