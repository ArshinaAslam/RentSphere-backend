import mongoose, { Schema } from "mongoose";

import type { Document } from "mongoose";

export interface IVisitBooking extends Document {
  propertyId: string;
  tenantId: string;
  landlordId: string;
  date: string;
  timeSlot: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const VisitBookingSchema: Schema = new Schema(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: "Landlord",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

VisitBookingSchema.index(
  { propertyId: 1, date: 1, timeSlot: 1 },
  { unique: true },
);

VisitBookingSchema.index({ tenantId: 1, status: 1 });
VisitBookingSchema.index({ landlordId: 1, status: 1 });

export default mongoose.models.VisitBooking ||
  mongoose.model<IVisitBooking>("VisitBooking", VisitBookingSchema);
