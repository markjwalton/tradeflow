import { z } from 'zod';

/**
 * Common validation schemas
 */
export const ValidationSchemas = {
  email: z.string().email('Please enter a valid email address'),
  
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[\d\s()+-]+$/, 'Please enter a valid phone number'),
  
  url: z.string().url('Please enter a valid URL'),
  
  postcode: z.string()
    .min(5, 'Please enter a valid postcode')
    .regex(/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i, 'Please enter a valid UK postcode'),
  
  required: z.string().min(1, 'This field is required'),
  
  optionalString: z.string().optional(),
  
  number: z.number().or(z.string().transform(val => Number(val))),
  
  positiveNumber: z.number().positive('Must be a positive number')
    .or(z.string().transform(val => Number(val))),
  
  date: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    'Please enter a valid date'
  ),
  
  futureDate: z.string().refine(
    (val) => new Date(val) > new Date(),
    'Date must be in the future'
  ),
  
  pastDate: z.string().refine(
    (val) => new Date(val) < new Date(),
    'Date must be in the past'
  ),
};

/**
 * Project validation schema
 */
export const projectSchema = z.object({
  name: ValidationSchemas.required,
  description: ValidationSchemas.optionalString,
  customerId: ValidationSchemas.optionalString,
  status: z.enum(['Planning', 'Active', 'On Hold', 'Completed', 'Archived']),
  projectType: z.enum(['New Build', 'Extension', 'Renovation', 'Conservation', 'Commercial']).optional(),
  startDate: ValidationSchemas.date.optional(),
  estimatedEndDate: ValidationSchemas.date.optional(),
  location: ValidationSchemas.optionalString,
  budget: ValidationSchemas.positiveNumber.optional(),
  isHighPriority: z.boolean().optional(),
});

/**
 * Task validation schema
 */
export const taskSchema = z.object({
  projectId: ValidationSchemas.required,
  name: ValidationSchemas.required,
  description: ValidationSchemas.optionalString,
  status: z.enum(['To Do', 'In Progress', 'Blocked', 'Completed', 'Snagging']),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  assignedTo: ValidationSchemas.optionalString,
  startDate: ValidationSchemas.date.optional(),
  dueDate: ValidationSchemas.date.optional(),
  estimatedHours: ValidationSchemas.positiveNumber.optional(),
});

/**
 * Customer validation schema
 */
export const customerSchema = z.object({
  name: ValidationSchemas.required,
  company: ValidationSchemas.optionalString,
  email: ValidationSchemas.email.optional(),
  phone: ValidationSchemas.phone.optional(),
  address: ValidationSchemas.optionalString,
  notes: ValidationSchemas.optionalString,
});

/**
 * Team member validation schema
 */
export const teamMemberSchema = z.object({
  name: ValidationSchemas.required,
  email: ValidationSchemas.email,
  phone: ValidationSchemas.phone.optional(),
  role: ValidationSchemas.required,
  skills: z.array(z.string()).optional(),
  availability: z.enum(['available', 'busy', 'on_leave', 'unavailable']).optional(),
});

/**
 * Helper to get error message for a field
 */
export function getFieldError(errors, fieldName) {
  return errors[fieldName]?.message;
}

/**
 * Helper to check if field has error
 */
export function hasFieldError(errors, fieldName) {
  return !!errors[fieldName];
}