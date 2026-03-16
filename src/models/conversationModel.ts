import mongoose, { Schema } from "mongoose";

import type { Document } from "mongoose";

export interface IConversation extends Document {
  tenantId: string;
  landlordId: string;
  inquiryId?: string;
  lastMessage: string;
  lastMessageAt: Date;
  lastMessageSenderRole?: "tenant" | "landlord";
  status: "active" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: "Landlord",
      required: true,
      index: true,
    },
    inquiryId: {
      type: Schema.Types.ObjectId,
      ref: "Inquiry",
    },
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageSenderRole: {
      type: String,
      enum: ["tenant", "landlord"],
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
  },
  { timestamps: true },
);

// One conversation per tenant-landlord pair
ConversationSchema.index({ tenantId: 1, landlordId: 1 }, { unique: true });

export default mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);
