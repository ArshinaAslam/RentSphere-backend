import express from "express";
import cors from "cors";

import { globalErrorHandler } from "./middleware/error.middleware";
import cookieParser from "cookie-parser";
import tenantRoutes from './routes/tenantRoutes';

import landlordRoutes from './routes/landlordRoutes';

import adminRoutes from './routes/adminRoutes'



const app = express();

app.use(cookieParser());

app.use(
    cors({
        origin: "http://localhost:3000",
        methods:["GET","POST","PUT","PATCH","DELETE"],
        credentials:true
    })
)

app.use(express.json());

 app.use("/api/admin",adminRoutes)
app.use("/api/landlord",landlordRoutes)
 app.use("/api/tenant",tenantRoutes)

 app.use(globalErrorHandler)



export default app;
