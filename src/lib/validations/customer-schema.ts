import * as z from "zod";

export const customerFormSchema = z.object({
  cCode: z.string().min(1, 'Customer code is required')
    .min(3, 'Customer code must be at least 3 characters')
    .max(20, 'Customer code cannot exceed 20 characters'),
  cName: z.string().min(1, 'Customer name is required')
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name cannot exceed 100 characters'),
  cEmail: z.string().min(1, 'Customer email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email too long'),
  cTel: z.string().min(1, 'Customer phone number is required'),
  cAddress: z.string().max(255, 'Address cannot exceed 255 characters').optional(),
  cDescription: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  cStatus: z.boolean().default(true),
  cCreatedBy: z.string().max(100, 'Created By cannot exceed 100 characters').optional(),
  cLastUpdatedBy: z.string().max(100, 'Last Updated By cannot exceed 100 characters').optional(),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;