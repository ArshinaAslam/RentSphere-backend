import mongoose, { Schema } from "mongoose";

import type { Document } from "mongoose";

export type NotificationType =
  | "lease_sent"
  | "lease_viewed"
  | "lease_signed"
  | "lease_active"
  | "deposit_paid"
  | "rent_paid"
  | "rent_due"
  | "late_fee"
  | "lease_expiring"
  | "inquiry_received"
  | "visit_booked";

export type RecipientRole = "tenant" | "landlord";

export interface INotification extends Document {
  recipientId: string;
  recipientRole: RecipientRole;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema(
  {
    recipientId: { type: Schema.Types.ObjectId, required: true },
    recipientRole: {
      type: String,
      enum: ["tenant", "landlord"],
      required: true,
    },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true },
);

NotificationSchema.index({ recipientId: 1, isRead: 1 });

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
