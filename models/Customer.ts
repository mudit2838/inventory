import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  name: string;
  phone?: string;
  email?: string;
  totalPurchases: number;
  totalDue: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    businessName: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    totalPurchases: { type: Number, default: 0 },
    totalDue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Create compound index on phone but sparsely since Walk-in customers may not have phones
CustomerSchema.index({ userId: 1, phone: 1 }, { unique: true, partialFilterExpression: { phone: { $exists: true, $ne: '' } } });

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
