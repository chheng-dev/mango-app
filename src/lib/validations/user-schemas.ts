import * as z from "zod";

// Base user validation schema
export const baseUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .regex(/^[a-zA-Z\s'-\.]+$/, "Name contains invalid characters"),
  
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email is too long")
    .toLowerCase(),
  
  code: z
    .string()
    .trim()
    .min(1, "User code is required")
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code cannot exceed 20 characters")
    .regex(/^[A-Z0-9_-]+$/, "Code can only contain uppercase letters, numbers, hyphens, and underscores")
    .transform((val) => val.toUpperCase()),
  
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .refine((phone) => {
      if (!phone || phone === '') return true;
      return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/[\s\-\(\)\.]/g, ''));
    }, "Please enter a valid phone number"),
  
  dob: z
    .union([z.string(), z.date()])
    .optional()
    .refine((val) => {
      if (!val) return true;
      if (val instanceof Date) return !isNaN(val.getTime());
      return !isNaN(Date.parse(val));
    }, "Invalid date format for Date of Birth"),

  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
});

// Password validation schema
export const passwordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain at least one number")
    .regex(/(?=.*[@$!%*?&])/, "Password must contain at least one special character"),
  
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords don't match",
  path: ["passwordConfirmation"],
});

// Create user schema (requires password)
export const createUserSchema = baseUserSchema.merge(passwordSchema).extend({
  roles: z.array(z.number().positive()).optional().default([]),
});

// Update user schema (password optional)
export const updateUserSchema = baseUserSchema.partial().extend({
  password: z.string().optional(),
  passwordConfirmation: z.string().optional(),
  roles: z.array(z.number().positive()).optional(),
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    if (!data.passwordConfirmation) return false;
    if (data.password !== data.passwordConfirmation) return false;
    if (data.password.length < 8) return false;
    if (!/(?=.*[a-z])/.test(data.password)) return false;
    if (!/(?=.*[A-Z])/.test(data.password)) return false;
    if (!/(?=.*\d)/.test(data.password)) return false;
    if (!/(?=.*[@$!%*?&])/.test(data.password)) return false;
  }
  return true;
}, {
  message: "Password must meet all requirements and passwords must match",
  path: ["passwordConfirmation"],
});

// Form schema for frontend (allows optional password)
export const userFormSchema = baseUserSchema.extend({
  password: z.string().optional(),
  passwordConfirmation: z.string().optional(),
  roles: z.array(z.number().positive()).default([]),
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    if (!data.passwordConfirmation) return false;
    if (data.password !== data.passwordConfirmation) return false;
    if (data.password.length < 8) return false;
    if (!/(?=.*[a-z])/.test(data.password)) return false;
    if (!/(?=.*[A-Z])/.test(data.password)) return false;
    if (!/(?=.*\d)/.test(data.password)) return false;
    if (!/(?=.*[@$!%*?&])/.test(data.password)) return false;
  }
  return true;
}, {
  // message: "Password must be at least 8 characters with uppercase, lowercase, number, special character, and passwords must match",
  // path: ["passwordConfirmation"],
});

// Type exports
export type BaseUser = z.infer<typeof baseUserSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserFormData = z.infer<typeof userFormSchema>;

// Helper function to create create schema with required password
export const createRequiredPasswordSchema = () => {
  return userFormSchema.refine((data) => {
    if (!data.password || data.password.length < 8) {
      return false;
    }
    if (data.password !== data.passwordConfirmation) {
      return false;
    }
    return true;
  }, {
    message: "Password is required and must meet all requirements",
    path: ["password"],
  });
};
