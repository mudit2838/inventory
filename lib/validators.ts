import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(32),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const productSchema = z.object({
  name: z.string().min(2).max(128),
  stock: z.number().int().nonnegative(),
  purchasePrice: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative(),
  shelf: z.string().min(1).max(64),
});

export const saleItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const saleSchema = z.object({
  items: z.array(saleItemSchema).min(1),
  customerId: z.string().optional(),
});

export const customerSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});
