import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { AdminModel } from "../models/adminModel";
import dotenv from "dotenv";

dotenv.config();

async function createAdmin() {
 
  await mongoose.connect(process.env.MONGO_URI!);

  const email = "admin@gmail.com";

  const existingAdmin = await AdminModel.findOne({ email });

  if (existingAdmin) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const admin = await AdminModel.create({
    email,
    passwordHash: await bcrypt.hash("Admin@123", 10),
    role: "ADMIN",
    isActive: true,
  });

  console.log("Admin created:", admin.email);
  process.exit(0);
}

createAdmin();
