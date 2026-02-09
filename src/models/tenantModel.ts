
import { Schema, model, Document } from "mongoose";

export type UserRole = "TENANT" | "LANDLORD" | "ADMIN";

export interface ITenant extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  isEmailVerified:boolean;
  isActive:boolean;
   googleId?: string;   
   avatar?: string;
   kycStatus?: "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED"; 
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    passwordHash: { type: String },
    role: { type: String, enum: ["TENANT", "LANDLORD", "ADMIN"], required: true },
    isEmailVerified : {type:Boolean,default:false},
    isActive : {type:Boolean,default:false},
     kycStatus: { 
      type: String, 
      enum: ["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"], 
      default: "NOT_SUBMITTED" 
    },
     googleId : {type:String},
     avatar : {type:String}
  },
  { timestamps: true }
);

export const TenantModel = model<ITenant>("User", TenantSchema);
