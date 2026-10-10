import { z } from 'zod';

export const mapColumnsSchema = z.object({
  body: z.object({
    jobId: z.string(),
    columnMapping: z.record(z.string())
  })
});
