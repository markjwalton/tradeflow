import { z } from 'zod';

/**
 * Common validation schemas
 */
export const validationSchemas = {
  email: z.string().email('Please enter a valid email address'),
  
  phone: z.string().regex(
    /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/,
    'Please enter a valid UK phone number'
  ).optional().or(z.literal('')),
  
  postcode: z.string().regex(
    /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
    'Please enter a valid UK postcode'
  ).optional().or(z.literal('')),
  
  url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  
  currency: z.number().min(0, 'Amount must be positive'),
  
  requiredString: z.string().min(1, 'This field is required'),
  
  optionalString: z.string().optional(),
  
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please enter a valid date',
  }),
  
  futureDate: z.string().refine((val) => new Date(val) > new Date(), {
    message: 'Date must be in the future',
  }),
};

/**
 * Project form schema
 */
export const projectSchema = z.object({
  name: validationSchemas.requiredString,
  description: validationSchemas.optionalString,
  customerId: validationSchemas.optionalString,
  clientEmail: validationSchemas.email.optional().or(z.literal('')),
  clientPhone: validationSchemas.phone,
  status: z.enum(['Planning', 'Active', 'On Hold', 'Completed', 'Archived']),
  startDate: validationSchemas.optionalString,
  estimatedEndDate: validationSchemas.optionalString,
  location: validationSchemas.optionalString,
  budget: z.number().min(0).optional(),
  projectType: z.enum(['New Build', 'Extension', 'Renovation', 'Conservation', 'Commercial']).optional(),
  notes: validationSchemas.optionalString,
});

/**
 * Task form schema
 */
export const taskSchema = z.object({
  projectId: validationSchemas.requiredString,
  name: validationSchemas.requiredString,
  description: validationSchemas.optionalString,
  status: z.enum(['To Do', 'In Progress', 'Blocked', 'Completed', 'Snagging']),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  assignedTo: validationSchemas.optionalString,
  startDate: validationSchemas.optionalString,
  dueDate: validationSchemas.optionalString,
  estimatedHours: z.number().min(0).optional(),
  notes: validationSchemas.optionalString,
});

/**
 * Customer form schema
 */
export const customerSchema = z.object({
  name: validationSchemas.requiredString,
  company: validationSchemas.optionalString,
  email: validationSchemas.email.optional().or(z.literal('')),
  phone: validationSchemas.phone,
  address: validationSchemas.optionalString,
  notes: validationSchemas.optionalString,
});

/**
 * Team member form schema
 */
export const teamMemberSchema = z.object({
  name: validationSchemas.requiredString,
  email: validationSchemas.email,
  phone: validationSchemas.phone,
  role: validationSchemas.optionalString,
  skills: z.array(z.string()).optional(),
  availability: z.enum(['available', 'busy', 'on_leave', 'unavailable']).optional(),
  annual_holiday_days: z.number().min(0).max(365).optional(),
  holidays_used: z.number().min(0).optional(),
});

/**
 * Get form error message
 */
export function getErrorMessage(error) {
  if (!error) return null;
  if (typeof error === 'string') return error;
  return error.message || 'Invalid value';
}