import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    email: z
      .string()
      .trim()
      .email('A valid email address is required')
      .max(255),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password cannot exceed 128 characters')
  }).refine((data) => !!(data.name || data.firstName), {
    message: 'Name is required',
    path: ['name']
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('A valid email address is required'),
    password: z.string().min(1, 'Password is required')
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email()
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    newPassword: z.string().min(8)
  })
});
