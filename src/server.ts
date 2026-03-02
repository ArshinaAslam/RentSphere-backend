import "reflect-metadata";
import "./container";
import app from "./app";
import { connectDb } from "./config/db";
import { ENV } from "./config/env";
import logger from "./utils/logger";

connectDb()
  .then(() => {
    app.listen(ENV.PORT, () => {
      logger.info(`Server running on port ${ENV.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
