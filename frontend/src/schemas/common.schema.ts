import { z } from 'zod';

export const emailSchema = z.string().email();
export const nonBlankString = z.string().min(1);
