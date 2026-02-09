

// models/adminModel.ts
import { Schema, model, Document } from "mongoose";

export interface IAdmin extends Document {  // ✅ FIXED: Add extends Document
  email: string;
  passwordHash: string;
  role: "ADMIN";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;  // ✅ Added for timestamps
}

const AdminSchema = new Schema<IAdmin>({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true  // ✅ Added
  },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "ADMIN" },
  isActive: { type: Boolean, default: true }
}, { 
  timestamps: true  // ✅ Enables createdAt/updatedAt
});

export const AdminModel = model<IAdmin>("Admin", AdminSchema);
