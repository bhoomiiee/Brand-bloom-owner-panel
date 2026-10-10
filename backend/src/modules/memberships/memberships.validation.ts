import { z } from 'zod';

export const inviteStaffSchema = z.object({
  body: z.object({
    email: z.string().email(),
    role: z.enum(['ADMIN', 'STAFF']),
    permissions: z.array(z.string()).optional()
  })
});
