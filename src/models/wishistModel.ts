import mongoose, { Schema } from "mongoose";

import type { Document } from "mongoose";

export interface IWishlist extends Document {
  tenantId: string;
  propertyId: string;
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

WishlistSchema.index({ tenantId: 1, propertyId: 1 }, { unique: true });

export default mongoose.models.Wishlist ||
  mongoose.model<IWishlist>("Wishlist", WishlistSchema);
