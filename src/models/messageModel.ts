import mongoose, { Schema } from "mongoose";

import type { Document } from "mongoose";

export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  senderRole: "tenant" | "landlord";
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["tenant", "landlord"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
