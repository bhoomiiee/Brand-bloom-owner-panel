import { z } from 'zod';

export const onboardingSchema = z.object({
  storeName: z.string().min(2)
});
