import * as z from "zod";

// Base permission validation schema
export const basePermissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Permission name is required")
    .min(2, "Permission name must be at least 2 characters")
    .max(100, "Permission name cannot exceed 100 characters"),
  
  resource: z
    .string()
    .trim()
    .min(1, "Resource is required")
    .min(2, "Resource must be at least 2 characters")
    .max(50, "Resource cannot exceed 50 characters")
    .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, "Resource must start with a letter and contain only letters, numbers, hyphens, and underscores"),
  
  action: z
    .string()
    .trim()
    .min(1, "Action is required")
    .min(2, "Action must be at least 2 characters")
    .max(50, "Action cannot exceed 50 characters")
    .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, "Action must start with a letter and contain only letters, numbers, hyphens, and underscores"),
  
  slug: z
    .string()
    .trim()
    .optional()
    .refine((slug) => {
      if (!slug) return true; // Optional field
      return /^[a-z0-9:_-]+$/.test(slug);
    }, "Slug can only contain lowercase letters, numbers, hyphens, and underscores"),
  
  description: z
    .string()
    .trim()
    .max(255, "Description cannot exceed 255 characters")
    .optional(),

  isActive: z.boolean().default(true),
});

// Create permission schema
export const createPermissionSchema = basePermissionSchema;

// Update permission schema (all fields optional)
export const updatePermissionSchema = basePermissionSchema.partial().refine((data) => {
  // At least one field must be provided for update
  const hasFields = Object.values(data).some(value => value !== undefined);
  return hasFields;
}, "At least one field must be provided for update");

// Form schema for frontend
export const permissionFormSchema = basePermissionSchema.extend({
  // Allow empty slug in forms - will be auto-generated
  slug: z.string().optional(),
});

// Type exports
export type BasePermission = z.infer<typeof basePermissionSchema>;
export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
export type PermissionFormData = z.infer<typeof permissionFormSchema>;

// Common permission resources and actions for validation
export const PERMISSION_RESOURCES = [
  'users',
  'roles', 
  'permissions',
  'reports',
  'settings',
  'dashboard'
] as const;

export const PERMISSION_ACTIONS = [
  'create',
  'read', 
  'update',
  'delete',
  'list',
  'export',
  'import'
] as const;

export type PermissionResource = typeof PERMISSION_RESOURCES[number];
export type PermissionAction = typeof PERMISSION_ACTIONS[number];
