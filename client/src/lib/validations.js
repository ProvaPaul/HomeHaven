import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain a letter')
      .regex(/\d/, 'Password must contain a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120, 'Max 120 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Max 5000 characters'),
  type: z.enum(['house', 'apartment', 'villa', 'condo', 'land', 'commercial'], {
    errorMap: () => ({ message: 'Select a property type' }),
  }),
  status: z.enum(['for-sale', 'for-rent', 'sold', 'rented']),
  price: z.coerce.number({ invalid_type_error: 'Enter a price' }).positive('Price must be positive'),
  bedrooms: z.coerce.number().min(0, 'Cannot be negative').max(50, 'Too many'),
  bathrooms: z.coerce.number().min(0, 'Cannot be negative').max(50, 'Too many'),
  area: z.coerce.number({ invalid_type_error: 'Enter the area' }).positive('Area must be positive'),
  yearBuilt: z
    .union([z.coerce.number().min(1800, 'Too old').max(new Date().getFullYear() + 2, 'Invalid year'), z.literal('')])
    .optional(),
  street: z.string().max(120).optional().or(z.literal('')),
  city: z.string().min(2, 'City is required'),
  state: z.string().max(60).optional().or(z.literal('')),
  zipCode: z.string().max(20).optional().or(z.literal('')),
});

export const contactSellerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().max(30).optional().or(z.literal('')),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Max 2000 characters'),
});

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
});
