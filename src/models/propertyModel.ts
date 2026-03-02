import mongoose, { Schema } from "mongoose";

import type { Document } from "mongoose";

export interface IProperty extends Document {
  landlordId: string;
  title: string;
  type: "Apartment" | "Villa" | "House";
  bhk: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  price: number;
  securityDeposit: number;
  vacant: number;
  status: "Available" | "Rented" | "Inactive";
  bedrooms: number;
  bathrooms: number;
  area: number;
  furnishing: string;
  description: string;
  amenities: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema = new Schema(
  {
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: "Landlord",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    bhk: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, required: true, min: 0 },
    vacant: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Available", "Rented", "Inactive"],
      default: "Available",
    },
    bedrooms: { type: Number, required: true, min: 1 },
    bathrooms: { type: Number, required: true, min: 1 },
    area: { type: Number, required: true, min: 0 },
    furnishing: { type: String, required: true },
    description: { type: String, required: true },
    amenities: [{ type: String }],
    images: [{ type: String }],
  },
  {
    timestamps: true,
  },
);

// Index for fast queries
PropertySchema.index({ landlordId: 1, status: 1 });
PropertySchema.index({ city: 1, status: 1 });

export default mongoose.models.Property ||
  mongoose.model<IProperty>("Property", PropertySchema);
