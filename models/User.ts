import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  businessName: string;
  plan: "free" | "pro" | "enterprise";
  planLimits: {
    maxProducts: number;
    maxSalesPerMonth: number;
  };
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // optional for OAuth if using it in future
  businessName: { type: String, required: true },
  plan: {
    type: String,
    enum: ["free", "pro", "enterprise"],
    default: "free",
  },
  planLimits: {
    maxProducts: { type: Number, default: 50 },
    maxSalesPerMonth: { type: Number, default: 100 }, // Defaults can be updated later per plan
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
