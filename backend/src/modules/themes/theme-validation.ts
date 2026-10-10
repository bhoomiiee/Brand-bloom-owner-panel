import { z } from 'zod';

export const themeConfigSchema = z.object({
  themeId: z.string(),
  colors: z.object({
    primary: z.string(),
    accent: z.string(),
    background: z.string(),
    surface: z.string()
  })
});
