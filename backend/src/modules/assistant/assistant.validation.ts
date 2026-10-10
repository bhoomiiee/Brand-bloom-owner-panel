import { z } from 'zod';

export const assistantQuerySchema = z.object({
  body: z.object({
    question: z.string().min(2)
  })
});
