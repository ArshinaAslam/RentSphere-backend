


import { Schema, model, Document } from "mongoose";

export interface IAdmin extends Document {  
  email: string;
  passwordHash: string;
  role: "ADMIN";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;  
}

const AdminSchema = new Schema<IAdmin>({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true  
  },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "ADMIN" },
  isActive: { type: Boolean, default: true }
}, { 
  timestamps: true  
});

export const AdminModel = model<IAdmin>("Admin", AdminSchema);
