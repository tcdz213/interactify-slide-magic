import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const titleSchema = z
  .string()
  .trim()
  .min(3, 'Title must be at least 3 characters')
  .max(200, 'Title must be less than 200 characters');

export const descriptionSchema = z
  .string()
  .trim()
  .max(5000, 'Description must be less than 5000 characters')
  .optional();

export const uuidSchema = z
  .string()
  .uuid('Invalid ID format');

export const urlSchema = z
  .string()
  .trim()
  .url('Invalid URL format')
  .max(2000, 'URL must be less than 2000 characters');

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

export const futureDateSchema = dateSchema.refine(
  (date) => new Date(date) > new Date(),
  'Date must be in the future'
);

export const pastDateSchema = dateSchema.refine(
  (date) => new Date(date) <= new Date(),
  'Date cannot be in the future'
);

// Task-specific schemas
export const taskStatusSchema = z.enum([
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'testing',
  'done',
  'blocked',
]);

export const taskTypeSchema = z.enum([
  'frontend',
  'backend',
  'mobile_android',
  'mobile_ios',
  'api',
  'design',
  'qa',
  'devops',
  'documentation',
  'other',
]);

export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const createTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  type: taskTypeSchema,
  priority: taskPrioritySchema,
  featureId: uuidSchema.optional(),
  sprintId: uuidSchema.optional(),
  assigneeId: uuidSchema.optional(),
  estimatedHours: z.number().min(0).max(999).optional(),
  dueDate: dateSchema.optional(),
  labels: z.array(z.string().max(50)).max(10).optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const timeLogSchema = z.object({
  hours: z.number().min(0.1, 'Hours must be at least 0.1').max(24, 'Hours cannot exceed 24'),
  date: pastDateSchema,
  description: z.string().trim().max(500, 'Description must be less than 500 characters').optional(),
});

export const commentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(5000, 'Comment must be less than 5000 characters'),
});

export const subtaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
});

// Sprint schemas
export const sprintStatusSchema = z.enum(['planning', 'active', 'completed', 'cancelled']);

export const createSprintSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  productId: uuidSchema,
  startDate: dateSchema,
  endDate: dateSchema,
  goals: z.array(z.string().max(500)).max(10).optional(),
});

// Feature schemas
export const featureStatusSchema = z.enum(['draft', 'proposed', 'approved', 'in_development', 'testing', 'released', 'archived']);
export const featurePrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const createFeatureSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  priority: featurePrioritySchema,
  productId: uuidSchema,
  targetReleaseDate: dateSchema.optional(),
});

// Product schemas
export const productStatusSchema = z.enum(['active', 'maintenance', 'deprecated', 'archived']);
export const productPlatformSchema = z.enum(['web', 'mobile', 'desktop', 'api', 'other']);

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: descriptionSchema,
  status: productStatusSchema.optional(),
  platform: productPlatformSchema,
  repositoryUrl: urlSchema.optional(),
  documentationUrl: urlSchema.optional(),
});

// Validation helper function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });
  
  return { success: false, errors };
}

// Sanitization helpers
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

export function sanitizeUrl(input: string): string {
  const sanitized = sanitizeString(input);
  
  // Only allow http, https protocols
  if (!/^https?:\/\//i.test(sanitized)) {
    return '';
  }
  
  return encodeURI(sanitized);
}

export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  
  return input.replace(/[&<>"']/g, (char) => map[char]);
}
