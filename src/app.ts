import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { globalErrorHandler } from "./middleware/error.middleware";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/auth/auth.routes";
import landlordRoutes from "./routes/landlordRoutes";
import tenantRoutes from "./routes/tenantRoutes";

const app = express();

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/landlord", landlordRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/auth", authRoutes);

app.use(globalErrorHandler);

export default app;
