import { Schema, model, Document } from "mongoose";
import { UserRole } from "./tenantModel";

export interface ILandlord extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
   googleId?:string;
   avatar?:string;
  
  
  kycStatus?: "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
  kycDetails?: {
    aadhaarNumber?: string;   
    panNumber?: string;        
  };
  kycDocuments?: {
    aadhaarFront?: string;     
    aadhaarBack?: string;     
    panCard?: string;          
    liveSelfie?: string;       
  };
  kycSubmittedAt?: Date;
  kycVerifiedAt?: Date;
  kycRejectedReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const LandlordSchema = new Schema<ILandlord>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true,
      trim: true 
    },
    phone: { 
      type: String},
    passwordHash: { type: String },
    role: { 
      type: String, 
      enum: ["TENANT", "LANDLORD", "ADMIN"], 
      default: "LANDLORD" 
    },
    
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    googleId:{type:String},
     avatar:{type:String},
    
    
    kycStatus: { 
      type: String, 
      enum: ["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"], 
      default: "NOT_SUBMITTED" 
    },
    kycDetails: {
      aadhaarNumber: { type: String },  
      panNumber: { type: String },      
    },
    kycDocuments: {
      aadhaarFront: { type: String },   
      aadhaarBack: { type: String },    
      panCard: { type: String },       
      liveSelfie: { type: String },     
    },
    kycSubmittedAt: { type: Date },
    kycVerifiedAt: { type: Date },
    kycRejectedReason: { type: String },
  },
  { 
    timestamps: true,
  
  }
);



export const LandlordModel = model<ILandlord>("Landlord", LandlordSchema);
