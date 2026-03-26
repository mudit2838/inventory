import mongoose, { Schema, Document } from 'mongoose';

export interface ICreditTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  customer: mongoose.Types.ObjectId;
  sale?: mongoose.Types.ObjectId;
  amount: number;
  type: 'charge' | 'payment';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CreditTransactionSchema = new Schema<ICreditTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    businessName: { type: String, required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    sale: { type: Schema.Types.ObjectId, ref: 'Sale' },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['charge', 'payment'], required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.CreditTransaction || mongoose.model<ICreditTransaction>('CreditTransaction', CreditTransactionSchema);
