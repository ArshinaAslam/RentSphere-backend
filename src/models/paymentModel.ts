import mongoose, { Schema } from "mongoose";

import type { Document } from "mongoose";

export type PaymentType = "deposit" | "rent" | "late_fee" | "refund";
export type PaymentStatus = "pending" | "completed" | "failed";

export interface IPayment extends Document {
  leaseId: string;
  tenantId: string;
  landlordId: string;
  propertyId: string;
  type: PaymentType;
  amount: number;
  platformFee: number;
  landlordAmount: number;
  status: PaymentStatus;
  dueDate?: Date;
  paidAt?: Date;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  month?: number;
  year?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema(
  {
    leaseId: { type: Schema.Types.ObjectId, ref: "Lease", required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: "Landlord",
      required: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    type: {
      type: String,
      enum: ["deposit", "rent", "late_fee", "refund"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    platformFee: { type: Number, required: true, min: 0 },
    landlordAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    dueDate: { type: Date },
    paidAt: { type: Date },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    month: { type: Number, min: 1, max: 12 },
    year: { type: Number },
    notes: { type: String },
  },
  { timestamps: true },
);

PaymentSchema.index({ tenantId: 1, status: 1 });
PaymentSchema.index({ landlordId: 1, status: 1 });
PaymentSchema.index({ leaseId: 1, type: 1 });

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);
