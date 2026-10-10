import { z } from 'zod';

export const storefrontQuerySchema = z.object({
  query: z.string().optional()
});
