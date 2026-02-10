import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/routes/auth.routes";
import { globalErrorHandler } from "./middleware/error.middleware";
import cookieParser from "cookie-parser";
import userRoutes from './modules/user/routes/users.routes';


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


 app.use("/api/auth",authRoutes);
 app.use("/api/user",userRoutes)
 app.use(globalErrorHandler)

// app.use("/api/admin",adminRoutes)

export default app;
