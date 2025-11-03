import * as z from "zod";

export const contactPersonSchema = z.object({
  cpCode: z.string().min(1, 'Contact person code is required')
    .min(3, 'Contact person code must be at least 3 characters')
    .max(20, 'Contact person code cannot exceed 20 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Contact person code can only contain uppercase letters, numbers, hyphens, and underscores'),
  cpName: z.string().min(1, 'Contact person name is required')
    .min(2, 'Contact person name must be at least 2 characters')
    .max(100, 'Contact person name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s'-\.]+$/, 'Contact person name contains invalid characters'),
  cCode: z.string().min(1, 'Customer code is required')
    .min(3, 'Customer code must be at least 3 characters')
    .max(20, 'Customer code cannot exceed 20 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Customer code can only contain uppercase letters, numbers, hyphens, and underscores'),
  // cTel: z.string().min(1, 'Contact person phone number is required')
    // .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
  cTel: z.string().min(1, 'Contact person phone number is required'),
  cEmail: z.string().min(1, 'Contact person email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email too long'),
  cStatus: z.boolean().default(true),
});

export type ContactPersonFormData = z.infer<typeof contactPersonSchema>;