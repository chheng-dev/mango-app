import { z } from 'zod';

export const roleFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required')
    .min(2, 'Role name must be at least 2 characters')
    .max(100, 'Role name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Role name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  slug: z
    .string()
    .min(1, 'Slug is required')
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .refine((slug) => !slug.startsWith('-') && !slug.endsWith('-'), {
      message: 'Slug cannot start or end with a hyphen',
    }),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters'),
  
  isActive: z
    .boolean(),
  
  permissions: z
    .array(z.number().positive())
    .min(1, 'At least one permission must be selected')
    .max(100, 'Cannot select more than 100 permissions'),
});

export type RoleFormData = z.infer<typeof roleFormSchema>;

// Partial schema for partial validation during form input
export const partialRoleFormSchema = roleFormSchema.partial();

// Individual field schemas for granular validation
export const nameSchema = roleFormSchema.pick({ name: true });
export const slugSchema = roleFormSchema.pick({ slug: true });
export const permissionsSchema = roleFormSchema.pick({ permissions: true });

// Helper function to generate slug from name
export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Helper function to validate individual fields
export function validateField<T extends keyof RoleFormData>(
  field: T,
  value: RoleFormData[T]
): string | null {
  try {
    const fieldSchema = roleFormSchema.pick({ [field]: true });
    fieldSchema.parse({ [field]: value });
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || 'Invalid value';
    }
    return 'Validation error';
  }
}

// Helper function to get form errors
export function getFormErrors(data: Partial<RoleFormData>): Record<string, string> {
  try {
    roleFormSchema.parse(data);
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return errors;
    }
    return { form: 'Validation error occurred' };
  }
}

// Helper function to safely parse form data
export function parseRoleFormData(data: unknown): {
  success: boolean;
  data?: RoleFormData;
  errors?: Record<string, string>;
} {
  try {
    const parsed = roleFormSchema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { form: 'Invalid data format' } };
  }
}
