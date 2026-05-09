import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { AdminModel } from "../models/adminModel";
import logger from "../utils/logger";

dotenv.config();

async function createAdmin() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    logger.error("MONGO_URI is not defined in environment variables");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const email = "admin@gmail.com";

  const existingAdmin = await AdminModel.findOne({ email });

  if (existingAdmin) {
    logger.info("Admin already exists");
    process.exit(0);
  }

  const admin = await AdminModel.create({
    email,
    passwordHash: await bcrypt.hash("Admin@123", 10),
    role: "ADMIN",
    isActive: true,
  });

  logger.info("Admin created successfully", { email: admin.email });
  process.exit(0);
}

void createAdmin();
