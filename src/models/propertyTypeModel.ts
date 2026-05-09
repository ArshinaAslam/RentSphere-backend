import mongoose, { Schema } from "mongoose";

import type { Document } from "mongoose";

export interface IPropertyType extends Document {
  name: string;
  isActive: boolean;
  createdAt: Date;
}

const PropertyTypeSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.models.PropertyType ||
  mongoose.model<IPropertyType>("PropertyType", PropertyTypeSchema);
