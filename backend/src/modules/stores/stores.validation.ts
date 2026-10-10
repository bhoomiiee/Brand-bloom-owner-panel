import { z } from 'zod';

export const createStoreSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Store name must be at least 2 characters').max(100),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens')
      .min(2)
      .max(100)
      .optional(),
    businessType: z.string().trim().min(1).max(50).optional().default('retail'),
    address: z
      .object({
        street: z.string().trim().max(200).optional(),
        city: z.string().trim().max(100).optional(),
        state: z.string().trim().max(100).optional(),
        postalCode: z.string().trim().max(20).optional(),
        country: z.string().trim().max(50).optional()
      })
      .optional(),
    logoUrl: z.string().trim().url().optional(),
    currency: z.string().trim().length(3).toUpperCase().optional(),
    timezone: z.string().trim().max(50).optional()
  })
});

export const updateStoreSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    businessType: z.string().trim().min(1).max(50).optional(),
    address: z
      .object({
        street: z.string().trim().max(200).optional(),
        city: z.string().trim().max(100).optional(),
        state: z.string().trim().max(100).optional(),
        postalCode: z.string().trim().max(20).optional(),
        country: z.string().trim().max(50).optional()
      })
      .optional(),
    logoUrl: z.string().trim().url().optional(),
    settings: z
      .object({
        currency: z.string().trim().length(3).toUpperCase().optional(),
        timezone: z.string().trim().max(50).optional(),
        taxRatePercentage: z.number().min(0).max(100).optional()
      })
      .optional()
  })
});

export const addMemberSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Valid email address is required'),
    role: z.enum(['staff', 'STAFF', 'admin', 'ADMIN']).transform(r => r.toLowerCase()).default('staff')
  })
});

