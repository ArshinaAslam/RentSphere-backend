import mongoose, { Schema } from "mongoose";

import type { Document } from "mongoose";

export type LeaseStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "signed"
  | "active"
  | "expired"
  | "terminated";

export type LeaseType = "fixed" | "monthly";

export interface ISignature {
  name: string;
  signedAt: Date;
}

export interface ILease extends Document {
  propertyId: string;
  landlordId: string;
  tenantId: string;
  rentAmount: number;
  securityDeposit: number;
  paymentDueDay: number;
  lateFee: number;
  startDate: Date;
  endDate: Date;
  leaseType: LeaseType;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  maxOccupants: number;
  noticePeriod: number;
  utilitiesIncluded: string[];
  termsAndConditions: string;
  status: LeaseStatus;
  tenantSignature?: ISignature;
  landlordSignature?: ISignature;
  sentAt?: Date;
  viewedAt?: Date;
  signedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SignatureSchema = new Schema<ISignature>(
  {
    name: { type: String, required: true },
    signedAt: { type: Date, required: true },
  },
  { _id: false },
);

const LeaseSchema = new Schema(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: "Landlord",
      required: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    securityDeposit: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDueDay: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
      default: 1,
    },
    lateFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    leaseType: {
      type: String,
      enum: ["fixed", "monthly"],
      required: true,
      default: "fixed",
    },
    petsAllowed: {
      type: Boolean,
      default: false,
    },
    smokingAllowed: {
      type: Boolean,
      default: false,
    },
    maxOccupants: {
      type: Number,
      default: 1,
      min: 1,
    },
    noticePeriod: {
      type: Number,
      default: 30,
      comment: "Days required for termination notice",
    },
    utilitiesIncluded: {
      type: [String],
      default: [],
      enum: ["electricity", "water", "wifi", "gas", "maintenance"],
    },
    termsAndConditions: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "draft",
        "sent",
        "viewed",
        "signed",
        "active",
        "expired",
        "terminated",
      ],
      default: "draft",
    },
    tenantSignature: { type: SignatureSchema },
    landlordSignature: { type: SignatureSchema },
    sentAt: { type: Date },
    viewedAt: { type: Date },
    signedAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.models.Lease ||
  mongoose.model<ILease>("Lease", LeaseSchema);
