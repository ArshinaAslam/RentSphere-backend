import "reflect-metadata";
import "./container";
import http from "http";

import app from "./app";
import { connectDb } from "./config/db";
import { ENV } from "./config/env";
import { startCronJobs } from "./cron/lease.cron";
import { initSocket } from "./socket/socket";
import logger from "./utils/logger";

const httpServer = http.createServer(app);

initSocket(httpServer);

connectDb()
  .then(() => {
    httpServer.listen(ENV.PORT, () => {
      logger.info(`Server running on port ${ENV.PORT}`);
      startCronJobs();
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
