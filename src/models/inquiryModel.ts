import mongoose, { Schema } from "mongoose";

import type { Document } from "mongoose";

export interface IInquiry extends Document {
  propertyId: string;
  tenantId:   string;
  landlordId: string;
  questions:  string[];
  message:    string;
  status:     "unread" | "read";
  createdAt:  Date;
  updatedAt:  Date;
}

const InquirySchema: Schema = new Schema(
  {
    propertyId: {
      type:     Schema.Types.ObjectId,
      ref:      "Property",
      required: true,
      index:    true,
    },
    tenantId: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },
    landlordId: {
      type:     Schema.Types.ObjectId,
      ref:      "Landlord",
      required: true,
      index:    true,
    },
    questions: {
      type:     [String],
      required: true,
    },
    message: {
      type:    String,
      default: "",
    },
    status: {
      type:    String,
      enum:    ["unread", "read"],
      default: "unread",
    },
  },
  { timestamps: true },
);

InquirySchema.index({ landlordId: 1, status: 1 });
InquirySchema.index({ tenantId: 1 });

export default mongoose.models.Inquiry ||
  mongoose.model<IInquiry>("Inquiry", InquirySchema);