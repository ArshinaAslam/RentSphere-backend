import mongoose, { Schema } from "mongoose";

import type { Document } from "mongoose";

export interface IAmenity extends Document {
  label: string;
  emoji: string;
  isActive: boolean;
  createdAt: Date;
}

const AmenitySchema = new Schema(
  {
    label: { type: String, required: true, unique: true, trim: true },
    emoji: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.models.Amenity ||
  mongoose.model<IAmenity>("Amenity", AmenitySchema);
