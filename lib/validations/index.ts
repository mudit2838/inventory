import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sku: z.string().min(2, "SKU must be at least 2 characters"),
  description: z.string().optional(),
  purchasePrice: z.number().min(0, "Purchase price cannot be negative"),
  sellingPrice: z.number().min(0, "Selling price cannot be negative"),
  stock: z.number().min(0, "Stock cannot be negative").default(0),
  minStockLevel: z.number().min(0, "Minimum stock cannot be negative").default(5),
  category: z.string().optional().default("General"),
  shelfNo: z.string().optional().or(z.literal("")),
});

export const saleItemSchema = z.object({
  product: z.string(),
  name: z.string(),
  quantity: z.number().min(1),
  purchasePrice: z.number().min(0),
  sellingPrice: z.number().min(0),
});

export const saleSchema = z.object({
  items: z.array(saleItemSchema).min(1, "At least one item is required"),
  paymentType: z.enum(["cash", "upi", "card", "credit"]),
  customerId: z.string().optional().nullable(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});

export const customerSchema = z.object({
  name: z.string().min(2, "Customer name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});
