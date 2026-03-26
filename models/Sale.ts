import mongoose, { Schema, Document } from 'mongoose';

export interface ISaleItem {
  product: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

export interface ISale extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  saleNumber: string;
  items: ISaleItem[];
  totalAmount: number;
  totalProfit: number;
  paymentType: 'cash' | 'upi' | 'card' | 'credit';
  customer?: mongoose.Types.ObjectId;
  customerName?: string;
  customerPhone?: string;
  status: 'completed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

const SaleItemSchema = new Schema<ISaleItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
});

const SaleSchema = new Schema<ISale>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    businessName: { type: String, required: true },
    saleNumber: { type: String, required: true },
    items: [SaleItemSchema],
    totalAmount: { type: Number, required: true },
    totalProfit: { type: Number, required: true },
    paymentType: {
      type: String,
      enum: ['cash', 'upi', 'card', 'credit'],
      required: true,
      default: 'cash',
    },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String },
    customerPhone: { type: String },
    status: { type: String, enum: ['completed', 'refunded'], default: 'completed' },
  },
  { timestamps: true }
);

// Ensure Sale Number is unique per tenant
SaleSchema.index({ userId: 1, saleNumber: 1 }, { unique: true });
SaleSchema.index({ createdAt: -1 });

export default mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);
