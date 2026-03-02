import mongoose from "mongoose";

import { ENV } from "./env";
import logger from "../utils/logger";

export const connectDb = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection failed", { error });
    process.exit(1);
  }
};
