import { z } from 'zod';

export const storefrontConfigSchema = z.object({
  themeId: z.string(),
  primaryColor: z.string()
});
