import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  name: string;
  sku: string;
  description?: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStockLevel: number;
  category: string;
  shelfNo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    businessName: { type: String, required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    description: { type: String },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    minStockLevel: { type: Number, required: true, default: 5, min: 0 },
    category: { type: String, default: 'General' },
    shelfNo: { type: String, default: '' },
  },
  { timestamps: true }
);

// Ensure SKU is unique per tenant
ProductSchema.index({ userId: 1, sku: 1 }, { unique: true });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
