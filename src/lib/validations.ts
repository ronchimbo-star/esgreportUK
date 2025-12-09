import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const reportSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  framework: z.enum(['GRI', 'SASB', 'TCFD', 'CDP', 'UNGC', 'SDG'], {
    errorMap: () => ({ message: 'Please select a valid framework' }),
  }),
  reporting_period_start: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date',
  }),
  reporting_period_end: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end date',
  }),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
}).refine(
  (data) => {
    const start = new Date(data.reporting_period_start);
    const end = new Date(data.reporting_period_end);
    return end > start;
  },
  {
    message: 'End date must be after start date',
    path: ['reporting_period_end'],
  }
);

export const profileSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters').max(50),
  last_name: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  job_title: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
});

export const dataEntrySchema = z.object({
  metric_name: z.string().min(1, 'Metric name is required'),
  value: z.number().min(0, 'Value must be non-negative'),
  unit: z.string().min(1, 'Unit is required'),
  data_source: z.string().min(1, 'Data source is required'),
  verification_status: z.enum(['unverified', 'verified', 'audited']),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
});

export const invoiceSchema = z.object({
  organizationId: z.string().uuid('Invalid organization ID'),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid due date',
  }),
});

export const customChargeSchema = z.object({
  organizationId: z.string().uuid('Invalid organization ID'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  amount: z.number().positive('Amount must be greater than 0'),
  hours: z.number().positive().optional(),
  hourlyRate: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
});

export const newsPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  excerpt: z.string().min(20, 'Excerpt must be at least 20 characters').max(300),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  featured_image_url: z.string().url('Invalid image URL').optional(),
});

export const teamInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'admin', 'viewer']),
  message: z.string().max(500).optional(),
});

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .trim();
};

export const sanitizeHtml = (html: string): string => {
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a'];

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);

  const nodesToRemove: Element[] = [];

  let node: Node | null = walker.currentNode;
  while (node) {
    if (node instanceof Element && !allowedTags.includes(node.tagName.toLowerCase())) {
      nodesToRemove.push(node);
    }
    node = walker.nextNode();
  }

  nodesToRemove.forEach((node) => node.remove());

  return doc.body.innerHTML;
};

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type DataEntryInput = z.infer<typeof dataEntrySchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type CustomChargeInput = z.infer<typeof customChargeSchema>;
export type NewsPostInput = z.infer<typeof newsPostSchema>;
export type TeamInviteInput = z.infer<typeof teamInviteSchema>;
