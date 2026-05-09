import mongoose, { Schema } from "mongoose";

import type { Document } from "mongoose";

export interface IReview extends Document {
  tenantId: string;
  propertyId: string;
  leaseId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    leaseId: { type: Schema.Types.ObjectId, ref: "Lease", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 500, required: true },
  },
  { timestamps: true },
);

export const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);
